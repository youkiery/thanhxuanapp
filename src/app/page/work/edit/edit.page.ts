import { Component, ElementRef, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { RestService } from 'src/app/services/rest.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
})
export class EditPage {
  public files: any
  // Progress in percentage
  percentage: Observable<number>;
  // Snapshot of uploading file
  snapshot: Observable<any>;

  @ViewChild('filechooser') fileChooserElementRef: ElementRef;
  constructor(
    public rest: RestService,
    public modal: ModalController,
  ) { }

  public dismiss() {
    this.modal.dismiss()
  }

  ionViewDidEnter() {
    this.listenerInputChange();
    // console.log(this.rest.temp.edit);
  }

  private listenerInputChange() {
    const wireUpFileChooser = () => {
      const elementRef = this.fileChooserElementRef.nativeElement as HTMLInputElement;
      elementRef.addEventListener('change', (evt: any) => {
        const files = evt.target.files as File[];
        for (let i = 0; i < files.length; i++) {
          // reading file
          let file = files[i];


          if (file.type.split('/')[0] !== 'image') {
            this.rest.notify('Không hỗ trợ định dạng file')
            continue
          }

          let reader = new FileReader();
          reader.readAsDataURL(file);

          reader.onload = (e) => {
            let image = new Image()
            image.src = (e.target.result).toString()
            image.onload = ((e) => {
              // resize image
              // start resize
              // max pixel = 640px
              let canvas = document.createElement("canvas")
              let context = canvas.getContext('2d')

              var ratio = 1;
              const max = 640
              if (image.width > max || image.height > max) {
                if (image.width > image.height) ratio = max / image.width;
                else ratio = max / image.height;
              }
              canvas.width = image.width * ratio;
              canvas.height = image.height * ratio;
              context.drawImage(image, 0, 0, canvas.width, canvas.height);

              this.rest.temp.edit.image.push(canvas.toDataURL("image/jpeg"))
            })
          };
        }
      }, false);
    };
    wireUpFileChooser();
  }

  public remove(index: number) {
    this.rest.temp.edit.image = this.rest.temp.edit.image.filter((item, item_index) => {
      return index !== item_index
    })
  }

  // public save() {
  //     this.rest.temp.edit.process = Number(this.rest.temp.edit.process)
  //     if (!this.rest.temp.edit.process || this.rest.temp.edit.process < 0 || this.rest.temp.edit.process > 100) this.rest.temp.edit.process = 0
  //     await this.rest.freeze()
  //     this.rest.check({
  //       action: 'work-save',
  //       startdate: this.rest.totime(this.rest.filter.work['startdate']),
  //       enddate: this.rest.totime(this.rest.filter.work['enddate']),
  //       keyword: this.rest.filter.work['keyword'],
  //       user: this.rest.filter.work['user'],
  //       id: this.rest.temp.edit.id,
  //       content: this.rest.temp.edit.content,
  //       process: this.rest.temp.edit.process,
  //       calltime: this.rest.totime(this.rest.temp.edit.calltime),
  //       note: this.rest.temp.edit.note
  //     }).then(data => {
  //       this.rest.temp.unread = data['unread']
  //       this.work['time'] = data['time']
  //       this.work['data'] = data['data']
  //       this.rest.tempParse()
  //       this.rest.defreeze()
  //       this.dismiss()
  //     }, (error) => { })
  // }

  public async save() {
    let list = []
    let check = 0

    await this.rest.freeze('Kiểm tra hình ảnh')
    new Promise(resolve => {
      if (!this.rest.temp.edit.image.length) {
        this.rest.defreeze()
        resolve('')
      }
      else {
        // console.log(this.rest.temp.edit.image.length);
        this.rest.temp.edit.image.forEach((item) => {
          // check if base64 data
          if (item.length) {
            check++
            // not empty string
            if (item.length < 200) {
              // not base64
              check--
              item = item.replace(/&/g, '[amp]')
              item = item.replace(/%2F/g, '[/]')
              list.push(item)
              // console.log(check);
              if (!check) {
                this.rest.defreeze()
                resolve('')
              }
            }
            else {
              // upload file
              this.uploadImage(item).then((data: string) => {
                check--
                if (data) {
                  console.log(data);
                  data = data.replace(/&/g, '[amp]')
                  data = data.replace(/%2F/g, '[/]')
                  list.push(data)
                }
                // uncomment if get formated data
                if (!check) {
                  this.rest.defreeze()
                  resolve('')
                }
              })
            }
          }
        });
        if (!check) {
          this.rest.defreeze()
          resolve('')
        }
      }
    }).then((data) => {
      // return 0 if overrange process (0 - 100)
      this.rest.temp.edit.process = Number(this.rest.temp.edit.process)
      let checker = !this.rest.temp.edit.process || this.rest.temp.edit.process < 0 || this.rest.temp.edit.process > 100
      if (checker) this.rest.temp.edit.process = 0
      this.saveSubmit(list)
    })
  }

  public async saveSubmit(list: any[]) {
    await this.rest.freeze('Đang cập nhật...')
    this.rest.check({
      action: 'work-save',
      startdate: this.rest.totime(this.rest.filter.work['startdate']),
      enddate: this.rest.totime(this.rest.filter.work['enddate']),
      keyword: this.rest.filter.work['keyword'],
      user: this.rest.filter.work['user'],
      id: this.rest.temp.edit.id,
      content: this.rest.temp.edit.content,
      process: this.rest.temp.edit.process,
      calltime: this.rest.totime(this.rest.temp.edit.calltime),
      note: this.rest.temp.edit.note,
      page1: this.rest.temp.page.undone,
      page2: this.rest.temp.page.done,
      image: list.join(','),
      status: this.rest.temp.reversal[this.rest.temp.segment]
    }).then(data => {
      this.rest.temp.unread = data['unread']
      this.rest.temp.data = data['list']
      this.rest.defreeze()
      this.dismiss()
    }, (error) => {
      this.rest.defreeze()
    })
  }

  public uploadImage(image: string) {
    return new Promise((resolve) => {
      // const path = 'images/' + new Date().getTime() + '.jpg';
      // let fileRef = this.storage.ref(path);
      // let base64 = image.substr(image.indexOf(',') + 1);
      // let metadata = {
      //   contentType: 'image/jpeg',
      // };

      // fileRef.putString(base64, 'base64', metadata).then((response) => {
      //   fileRef.getDownloadURL().subscribe(url => {
      //     resolve(url)
      //   })
      // }, (error) => {
      //   resolve(0)
      // })
    })
  }
}
