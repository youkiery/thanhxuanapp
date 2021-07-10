import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { RestService } from 'src/app/services/rest.service';

@Component({
  selector: 'app-insert',
  templateUrl: './insert.page.html',
  styleUrls: ['./insert.page.scss'],
})
export class InsertPage {
  public content: string = ''
  public userid: any
  public time = {
    cometime: '',
    calltime: ''
  }
  public picker = {
    cometime: '',
    calltime: ''
  }
  constructor(
    public rest: RestService,
    public modal: ModalController
  ) { }

  ionViewWillEnter() {
    // console.log(this.rest.today);
    this.time.cometime = this.rest.today
    this.time.calltime = this.rest.today
    this.userid = this.rest.config.user[0]['userid']
  }

  public datepicker(name: string) {
    let datetime = this.rest.parseDate(this.picker[name])
    this.time[name] = datetime.datestring
  }

  public async insert() {
    if (!this.content.length) this.rest.notify('Nội dung công việc trống')
    else {
      // console.log(this.cometime, this.calltime);
      await this.rest.freeze('Đang thêm công việc')
      this.rest.check({
        action: 'work-insert',
        startdate: this.rest.totime(this.rest.temp.filter['startdate']),
        enddate: this.rest.totime(this.rest.temp.filter['enddate']),
        keyword: this.rest.temp.filter['keyword'],
        page1: this.rest.temp.page.undone,
        page2: this.rest.temp.page.done,
        user: this.rest.temp.filter['user'],
        employ: this.userid,
        content: this.content,
        cometime: this.time.cometime,
        calltime: this.time.calltime,
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
  }

  public dismiss() {
    this.modal.dismiss()
  }
}
