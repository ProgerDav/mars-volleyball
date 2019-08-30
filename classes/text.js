export default class Text {
  interval;
  bubble;
  wordArr = ['Wow!', 'Nice!', 'Well Played', 'Zzzzz...'];
  interval;
  continue = true;


  constructor(interval, bubble) {
    this.interval = interval
    this.bubble = bubble
  }

  initInterval() {

    setTimeout(() => {

      if (this.bubble.hasClass('show') && !this.bubble.hasClass('int')) {
        this.bubble.addClass('int')
        return false;
      }

      this.bubble.toggleClass('show int');

      if (this.bubble.hasClass('int')) {
        const wordToDisplay = this.wordArr[getRandomInt(0, this.wordArr.length)];
        this.bubble.text(wordToDisplay);
      } else
        this.bubble.text('');


      if (this.continue)
        this.initInterval();
    },
      this.bubble.hasClass('show int') ? 5000 : this.interval
    );
  }

  destroyInterval() {
    this.continue = false;
  }
}