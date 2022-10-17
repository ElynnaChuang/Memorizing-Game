const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatchFailed: 'CardsMatchFailed',
  CardsMatched: 'CardsMatched',
  GameFinished: 'GameFinished'
}

const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png'
  ,'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png'
  ,'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png'
  ,'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png'
]//黑桃、紅心、方塊、梅花

const view = {
  getCardBack (index) {
    return `<div class="card back" data-index="${index}"></div>`
  },

  getCardElement(index){ //利用0~52來決定花色跟數字
    const num = this.transformNums((index % 13) + 1)
    const symbol = Symbols[Math.floor(index/13)]
    return `<p>${num}</p>
    <img src="${symbol}" alt="">
    <p>${num}</p>
    `
  },
  transformNums (num) {
    switch (num) {
      case 1 :
        return 'A'
      case 11 :
        return 'J'
      case 12 :
        return 'Q'
      case 13 :
        return 'K'
      default :
        return num
    }
  },
  renderCards(indexes) { //indexes = array
    const cardsDisp = document.querySelector('#cards')
    cardsDisp.innerHTML = indexes.map( index => this.getCardBack(index))
    .join('')
    //Array(52)會創造一個有52個空位的array
    //array.keys()會創造一個新的迭代器，如果用for-of console.log(key)，會印出0~52
    //array.from(x)會根據x來創造一個新的陣列
  },

  //呼叫時 flipCards(1, 2, 3, 4, 5...)
  // 自動將參數變成 [1, 2, 3, 4, 5] 並傳入
  flipCards(...cards) {
    cards.map( card => {
      if (card.classList.contains('back')){
        card.classList.remove('back')
        card.innerHTML = this.getCardElement(Number(card.dataset.index))
        return
      }
      card.classList.add('back')
      card.innerHTML = ''
    })
  },

  pairCards(...cards) {
    cards.map (card => {
      card.classList.add('paired')
    })
  },

  renderScore(score) {
    document.querySelector('#score').textContent = `Score : ${score}`
  },

  renderTriedTimes(triedTimes) {
    document.querySelector('#tried-times').textContent = `You've tried : ${triedTimes} times`
  },

  appendWrongAnimation(...cards) {
    cards.map( card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', el => {
        card.classList.remove('wrong')
      },{
        once: true //代表此EventListener 只會觸發一次，觸發後即會消失，對瀏覽器效能影響較小
      })
    })
  },

  renderCompletedView (score, triedTimes) {
    const div = document.createElement('div')
    div.classList.add('complete')
    div.innerHTML = `
    <div class="title">Complete !</div>
    <div class="content">
        <div>Your Score : ${score}</div>
        <div>You've tried ${triedTimes} times</div>
    </div>
    `
    const cards = document.querySelector('#cards')
    cards.after(div)
  }
}

const utility = {
  getRandomCards (count) {
    const num = Array.from(Array(count).keys())
    for (let index = num.length - 1 ; index>0 ; index --){
      let randomIndex = Math.floor(Math.random() * (index + 1))
      ;[num[index], num[randomIndex]] = [num[randomIndex], num[index]]
    }
    return num //Array
  }
}

const model = { //save data
  revealedCards :[],

  isRevealCardsMatched() {
    const a = this.revealedCards[0].dataset.index % 13
    const b = this.revealedCards[1].dataset.index % 13
    return a === b
  },
  score: 0,
  triedTimes: 0
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCard() {
    view.renderCards(utility.getRandomCards(52))
  },

  resetCards(){
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  },

  //依照不同遊戲狀態做不同的行為
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break

      case GAME_STATE.SecondCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        if(model.isRevealCardsMatched()) {
          this.currentState = GAME_STATE.CardsMatched
          view.renderScore(model.score += 10)
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 260) {
            console.log('finish')
            this.currentState = GAME_STATE.GameFinished
            view.renderCompletedView(model.score, model.triedTimes)
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          //setTimeout的第一個參數要的是函式，非函式呼叫後的結果，所以不能加()
          setTimeout(this.resetCards, 1000)
        }
        view.renderTriedTimes(model.triedTimes += 1)
        break
    }
  }
}

controller.generateCard()

// Node List (array-like but not array)
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})