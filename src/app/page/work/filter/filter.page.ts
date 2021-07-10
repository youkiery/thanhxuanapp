import { Component, Input } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { RestService } from 'src/app/services/rest.service';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.page.html',
  styleUrls: ['./filter.page.scss'],
})
export class FilterPage {
  public check: boolean = false
  constructor(
    public alert: AlertController,
    public rest: RestService,
    public modal: ModalController
  ) { }

  public checkall() {
    this.rest.temp.filter['user'] = []
    let list = []
    if (this.check) {
      this.rest.config.user.forEach((item) => {
        list.push(item['name'])
        this.rest.temp.filter['user'].push(item['userid'])
      })
    }
    this.rest.temp.userlist = list.join(', ')
  }

  public dismiss() {
    this.modal.dismiss()
  }

  public async filter() {
    await this.rest.freeze('Lọc công việc')
    this.rest.temp.page = {
      'undone': 1,
      'done': 1
    }

    this.rest.check({
      action: 'work-init',
      startdate: this.rest.totime(this.rest.temp.filter.startdate),
      enddate: this.rest.totime(this.rest.temp.filter.enddate),
      keyword: this.rest.temp.filter['keyword'],
      user: this.rest.temp.filter['user'].join(','),
      page1: this.rest.temp.page.undone,
      page2: this.rest.temp.page.done,
    }).then(data => {
      this.rest.temp.init = 1
      this.rest.temp.unread = data.unread
      this.rest.temp.data = data.list
      this.rest.defreeze()
      this.dismiss()
    }, () => {
      this.rest.defreeze()
    })
  }

  public async selectEmploy() {
    let input = []
    this.rest.config.user.forEach((item) => {
      let checked = false
      if (this.rest.temp.filter['user'].indexOf(item['userid']) >= 0) checked = true
      input.push({
        type: 'checkbox',
        label: item['name'],
        value: item['userid'],
        checked: checked
      })
    })
    let alert = await this.alert.create({
      header: 'Select employ list',
      inputs: input,
      buttons: [
        {
          text: 'Cancel',
          handler: () => {  }
        }, {
          text: 'Ok',
          handler: (e) => {
            let list = []
            this.rest.temp.filter['user'] = []
            e.forEach((item: string) => {
              let current = this.rest.config.user.filter((item2) => {
                return item2['userid'] === item
              })
              if (current.length) {
                list.push(current[0]['name'])
                this.rest.temp.filter['user'].push(current[0]['userid'])
              }
            })
            this.rest.temp.userlist = list.join(', ')
          }
        }
      ]
    })
    alert.present()
  }

  public clear() {
    this.rest.temp.filter.startdate = ''
  }
}
