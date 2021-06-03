import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { RestService } from 'src/app/services/rest.service';
import { DetailPage } from './detail/detail.page';
import { EditPage } from './edit/edit.page'
import { FilterPage } from './filter/filter.page';
import { InsertPage } from './insert/insert.page'
import { PrintPage } from './print/print.page';

@Component({
  selector: 'app-work',
  templateUrl: './work.page.html',
  styleUrls: ['./work.page.scss'],
})
export class WorkPage implements OnInit {
  public id = 0
  constructor(
    public rest: RestService,
    public modal: ModalController,
    public alert: AlertController
  ) { }

  ngOnInit() { }

  ionViewDidEnter() {
    this.rest.freeze('Đang lấy dữ liệu...')
    this.rest.work.page = {
      'undone': 1,
      'done': 1
    }

    this.rest.check({
      action: 'work-init',
      time: this.rest.work['time'],
      startdate: this.rest.totime(this.rest.work.filter.startdate),
      endate: this.rest.totime(this.rest.work.filter['enddate']),
      keyword: this.rest.work.filter['keyword'],
      user: this.rest.work.filter['user'].join(','),
      page1: this.rest.work.page.undone,
      page2: this.rest.work.page.done,
    }).then(data => {
      this.rest.work.init = 1
      this.rest.work.unread = data.unread
      this.rest.work.data = data.list
      this.rest.defreeze()
    }, (error) => { 
      this.rest.defreeze()
    })
  }

  public filter() {
    return new Promise(resolve => {
      this.rest.check({
        action: 'work-auto',
        time: this.rest.work['time'],
        startdate: this.rest.totime(this.rest.work.filter.startdate),
        endate: this.rest.totime(this.rest.work.filter['enddate']),
        keyword: this.rest.work.filter['keyword'],
        user: this.rest.work.filter['user'].join(','),
        page: this.rest.work.page[this.rest.work.segment],
        status: this.rest.work.reversal[this.rest.work.segment]
      }).then(response => {
        this.rest.work.unread = response['unread']
        if (response.list.length) this.rest.work.data[this.rest.work.segment] = this.rest.work.data[this.rest.work.segment].concat(response.list)
        resolve('')
      }, (error) => { 
        resolve('')
      })
    })
  }

  public async print() {
    if (this.rest.config['work'] < 2) this.rest.notify('Chưa cấp quyền truy cập')
    else {
      const modal = await this.modal.create({
        component: PrintPage,
        componentProps: {
          startdate: this.rest.totime(this.rest.work.filter['startdate']),
          enddate: this.rest.totime(this.rest.work.filter['enddate']),
          keyword: this.rest.work.filter['keyword'],
          user: this.rest.work.filter['user'],
          page: this.rest.work.page[this.rest.work.segment]
        }
      })
      modal.present()
    }
  }

  public async detail(id: number) {
    await this.rest.freeze('Getting data')
    let current = this.rest.work.data.undone.filter((item) => {
      return item['id'] == id
    })
    if (!current.length) {
      current = this.rest.work.data.done.filter((item) => {
        return item['id'] == id
      })
    }

    current = current[0]
    this.rest.work.edit = {
      'id': current['id'],
      'content': current['content'],
      'note': current['note'],
      'calltime': this.rest.todate(current['calltime']),
      'process': Number(current['process']),
      'image': current['image']
    }
    const modal = await this.modal.create({
      component: DetailPage
    })
    await modal.present().then(() => {
      this.rest.defreeze()
    })
  }

  public async done(id: number) {
    const alert = await this.alert.create({
      header: 'Chú ý!!!',
      message: 'Công việc sẽ được chuyển sang mục hoàn thành',
      buttons: [
        {
          text: 'Trở về',
          role: 'cancel',
          cssClass: 'default'
        }, {
          text: 'Xác nhận',
          cssClass: 'danger',
          handler: () => {
            this.id = id
            this.doneSubmit()
          }
        }
      ]
    });

    await alert.present();
  }

  public async doneSubmit() {
    await this.rest.freeze('Đang hoàn thành')
    this.rest.check({
      action: 'work-done',
      startdate: this.rest.totime(this.rest.work.filter['startdate']),
      enddate: this.rest.totime(this.rest.work.filter['enddate']),
      keyword: this.rest.work.filter['keyword'],
      user: this.rest.work.filter['user'],
      page1: this.rest.work.page.undone,
      page2: this.rest.work.page.done,
      id: this.id,
      status: this.rest.work.reversal[this.rest.work.segment]
    }).then((data) => {
      this.rest.work.unread = data['unread']
      this.rest.work['time'] = data['time']
      this.rest.work.data = data['list']
      this.rest.defreeze()
    }, (error) => {
      this.rest.defreeze()
    })
  }

  public async remove(id: number) {
    const alert = await this.alert.create({
      header: 'Chú ý!!!',
      message: 'Công việc sẽ bị xóa vĩnh viễn',
      buttons: [
        {
          text: 'Trở về',
          role: 'cancel',
          cssClass: 'default'
        }, {
          text: 'Xác nhận',
          cssClass: 'danger',
          handler: () => {
            this.id = id
            this.removeSubmit()
          }
        }
      ]
    });

    await alert.present();
  }

  public async removeSubmit() {
    await this.rest.freeze('Đang xóa công việc')
    this.rest.check({
      action: 'work-remove',
      startdate: this.rest.totime(this.rest.work.filter['startdate']),
      enddate: this.rest.totime(this.rest.work.filter['enddate']),
      keyword: this.rest.work.filter['keyword'],
      user: this.rest.work.filter['user'],
      page1: this.rest.work.page.undone,
      page2: this.rest.work.page.done,
      id: this.id,
      status: this.rest.work.reversal[this.rest.work.segment]
    }).then((data) => {
      this.rest.work.unread = data['unread']
      this.rest.work['time'] = data['time']
      this.rest.work.data = data['list']
      this.rest.defreeze()
    }, (error) => {
      this.rest.defreeze()
    })
  }

  public async filterM() {
    if (this.rest.config['work'] < 2) this.rest.notify('Chưa cấp quyền truy cập')
    else {
      const modal = await this.modal.create({
        component: FilterPage,
        componentProps: {
          startdate: this.rest.totime(this.rest.work.filter['startdate']),
          enddate: this.rest.totime(this.rest.work.filter['enddate']),
          keyword: this.rest.work.filter['keyword'],
          user: this.rest.work.filter['user'],
          'page': this.rest.work.page[this.rest.work.segment]
        }
      })
      await modal.present()
    }
  }

  public async insert() {
    if (this.rest.config['work'] < 2) this.rest.notify('Chưa cấp quyền truy cập')
    else {
      const modal = await this.modal.create({
        component: InsertPage,
      })
      await modal.present()
    }
  }

  public async edit(index: number) {
    let current = this.rest.work.data[this.rest.work['segment']][index]
    
    this.rest.work.edit = {
      'id': current['id'],
      'content': current['content'],
      'note': current['note'],
      'calltime': this.rest.todate(current['calltime']),
      'process': Number(current['process']),
      'image': current['image']
    }
    const modal = await this.modal.create({
      component: EditPage,
    })
    await modal.present()
  }

  public async notify() {
    this.rest.router.navigateByUrl('/work/notify')
  }

  public loadData(event: any) {
    this.rest.work.page[this.rest.work.segment] ++
    
    this.filter().then(() => {
      event.target.complete()
    })
  }
}
