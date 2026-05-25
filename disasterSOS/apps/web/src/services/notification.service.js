class NotificationService {
  async requestPermission() {
    return Notification.requestPermission();
  }
}
export default new NotificationService();
