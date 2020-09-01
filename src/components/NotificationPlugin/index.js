import Notifications from './Notifications.vue';
import constants from '@/custom/assets/js/constants';

const NotificationStore = {
  state: [], // here the notifications will be added
  settings: {
    overlap: false,
    verticalAlign: 'top',
    horizontalAlign: 'right',
    type: 'info',
    timeout: 5000,
    closeOnClick: true,
    showClose: true
  },
  notifications: [],
  setOptions(options) {
    this.settings = Object.assign(this.settings, options);
  },
  removeNotification(timestamp) {
    const indexToDelete = this.state.findIndex(n => n.timestamp === timestamp);
    if (indexToDelete !== -1) {
      this.state.splice(indexToDelete, 1);
    }
  },
  addNotification(notification) {
    if (typeof notification === 'string' || notification instanceof String) {
      notification = { message: notification };
    }
    notification.timestamp = new Date();
    notification.timestamp.setMilliseconds(
      notification.timestamp.getMilliseconds() + this.state.length
    );
    notification = Object.assign({}, this.settings, notification);

    notification.verticalAlign = 'bottom'
    notification.horizontalAlign = 'right'
    this.state.push(notification);
    if (this.notifications.length >= constants.maxRows / 2) {      
      this.notifications.splice(0,1)
    }
    this.notifications.push(notification.message)
  },
  notify(notification) {
    if (Array.isArray(notification)) {
      notification.forEach(notificationInstance => {
        this.addNotification(notificationInstance);
      });
    } else {
      this.addNotification(notification);
    }
  }
};

const NotificationsPlugin = {
  install(Vue, options) {
    let app = new Vue({
      data: {
        notificationStore: NotificationStore
      },
      methods: {
        notify(notification) {
          this.notificationStore.notify(notification);
        }
      }
    });
    Vue.prototype.$notify = app.notify;
    Vue.prototype.$notifications = app.notificationStore;
    Vue.component('Notifications', Notifications);
    if (options) {
      NotificationStore.setOptions(options);
    }
  }
};

export default NotificationsPlugin;
