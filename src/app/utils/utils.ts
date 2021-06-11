export class Utils {
  /**
   * Format date dd/mm/yy hh:mm:ss
   * @param date date object
   * @returns date formatted
   */

  static formateDate2(date: Date): string {
    let day = '' + date.getDate();
    let month = '' + (date.getMonth() + 1);
    let year = '' + date.getFullYear();

    let hour = '' + date.getHours();
    let min = '' + date.getMinutes();
    let sec = '' + date.getSeconds();

    if (day.length < 2) {
      day = `0${day}`;
    }

    if (month.length < 2) {
      month = `0${month}`;
    }

    if (hour.length < 2) {
      hour = `0${hour}`;
    }
    if (min.length < 2) {
      min = `0${min}`;
    }
    if (sec.length < 2) {
      sec = `0${sec}`;
    }

    return (
      month +
      '/' +
      day +
      '/' +
      year.slice(-2) +
      '\n' +
      hour +
      ':' +
      min +
      ':' +
      sec
    );
  }
}
