//index.js
//获取应用实例
import audioList from './data.js'
import util from '../../utils/util.js'

var app = getApp()

const backgroundAudioManager = wx.getBackgroundAudioManager()


Page({
  data: {
    audioList: audioList,
    audioIndex: 0,
    audioSize: 20,
    pauseStatus: true,
    audioPalyStatus: 0,
    listShow: false,
    timer: '',
    currentPosition: 0,
    duration: 0,
    hasMore: true,
    loadHidden: true,
    prev: false,
    show: true,
    open: false,
    mark: 0,
    newmark: 0,
    startmark: 0,
    endmark: 0,
    windowWidth: wx.getSystemInfoSync().windowWidth,
    staus: 1,
    translate: ''

  },

  onLoad: function (options) {
    console.log(options.name)
    let that = this
    console.log('onLoad params:' + options.name)
    //  获取本地存储存储audioIndex
    var audioIndexStorage = wx.getStorageSync('audioIndex')
    var audioIndexNow = (audioIndexStorage && audioIndexStorage < that.data.audioList.length) ? audioIndexStorage : 0
    this.setData({
      audioIndex: audioIndexNow
    })
    wx.setStorageSync('audioIndex', audioIndexNow)
    console.log('默认的audioIndex:' + this.data.audioIndex)
    if (options.name !== undefined) {
      //检测本地是否存在歌曲
      var exists = false
      for (var i = 0; i < this.data.audioList.length; i++) {
        if (that.data.audioList[i].name === options.name) {
          console.log('exists share music')
          audioIndexNow = i
          that.setData({
            audioIndex: audioIndexNow
          })
          wx.setStorageSync('audioIndex', audioIndexNow)
          exists = true
          break;
        }
      }
      if (!exists) { //不存在则加入分享歌曲
        var shareData = [{
          name: options.name,
          poster: options.poster,
          src: options.src,
          author: options.author
        }]
        let updata = that.data.audioList.concat(shareData);
        audioIndexNow = that.data.audioList.length
        this.setData({
          audioList: updata,
          audioIndex: audioIndexNow,
          sliderValue: 0,
          currentPosition: 0,
          duration: 0,
          audioPalyStatus: 0,
        })
        console.log('不存在则加入分享歌曲:' + audioIndexNow)
        wx.setStorageSync('audioIndex', audioIndexNow)
      }
    }

    //自动播放下一首


    // wx.onBackgroundAudioStop(function () {
    //   that.bindTapNext()
    // })
    // let nextTimer = setInterval(function() {
    //   if (that.data.audioPalyStatus === 2) {
    //     if (that.data.pauseStatus === false) {
    //       that.bindTapNext()
    //     }
    //   }
    // }, 2000)
  },

  onReady: function (e) {
    console.log('onReady')
    app.getUserInfo(function (userinfo) {
      //console.log(userinfo);
    })
    // 使用 wx.createAudioContext 获取 audio 上下文 context
    // this.audioCtx = wx.createAudioContext('audio')
  },
  bindSliderchange: function (e) {
    // this.setData({
    //   listShow: true
    // })
    // clearInterval(this.data.timer)
    let value = e.detail.value
    // console.log(e)
    let that = this
    console.log(e.detail.value)
    wx.getBackgroundAudioPlayerState({
      success: function (res) {
        console.log(res)
        let {
          status,
          duration
        } = res;
        // console.log(res.duration)
        if (status === 1 || status === 0) {
          that.setData({
            sliderValue: value,
          })
          var position = value * duration / 100

          // console.log(BackgroundAudioManager)

          backgroundAudioManager.seek(position)

        }
      }
    })
    console.log('滑动了')
  },
  bindTapPrev: function () {
    console.log('bindTapNext')
    console.log(this.data)
    let length = this.data.audioList.length
    let audioIndexPrev = this.data.audioIndex
    let audioIndexNow = audioIndexPrev
    if (audioIndexPrev === 0) {
      audioIndexNow = length - 1
    } else {
      audioIndexNow = audioIndexPrev - 1
    }
    this.setData({
      prev: true,
      audioIndex: audioIndexNow,
      sliderValue: 0,
      currentPosition: 0,
      duration: 0,
      audioPalyStatus: 0,
    })

    let that = this
    setTimeout(() => {
      if (that.data.pauseStatus === false) {
        that.play()
        that.setData({
          prev: false
        })
      }
    }, 1000)
    wx.setStorageSync('audioIndex', audioIndexNow)

  },

  bindTapNext: function () {
    console.log('bindTapNext')
    let thats = this
    let length = this.data.audioList.length
    let audioIndexPrev = this.data.audioIndex
    let audioSize = this.data.audioSize
    let audioIndexNow = audioIndexPrev
    if (audioIndexPrev === length - 1) {
      if (length / audioSize > 0) { //分页大于0，有分页
        let pageSize = parseInt(length / audioSize) + 1
        console.log('pageSize:' + pageSize)
        console.log(app.globalData.userInfo)
        wx.request({
          url: 'https://www.bywei.cn/upload/wukong/data.json',
          data: {
            pageSize: pageSize,
            userInfo: JSON.stringify(app.globalData.userInfo)
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            console.log("up length begin:" + thats.data.audioList.length)
            if (res.data.length > 0) {
              let updata = thats.data.audioList.concat(res.data)
              thats.setData({
                audioList: updata,
                prev: false
              })
              length = thats.data.audioList.length
              audioIndexNow = audioIndexPrev + 1
            }
            console.log("up length end:" + thats.data.audioList.length)
          }
        })
      }
      audioIndexNow = 0
    } else {
      audioIndexNow = audioIndexPrev + 1
    }
    this.setData({
      audioIndex: audioIndexNow,
      sliderValue: 0,
      currentPosition: 0,
      duration: 0,
      audioPalyStatus: 0,
    })
    let that = this
    setTimeout(() => {
      if (that.data.pauseStatus === false) {
        that.play()
      }
    }, 1000)
    wx.setStorageSync('audioIndex', audioIndexNow)
  },
  bindTapPlay: function () {
    console.log('bindTapPlay')
    console.log(this.data.pauseStatus)
    if (this.data.pauseStatus === true) {
      this.play()
      this.setData({
        pauseStatus: false
      })
    } else {
      wx.pauseBackgroundAudio()
      this.setData({
        pauseStatus: true
      })
    }
  },
  bindTapList: function (e) {
    console.log('bindTapList')
    console.log(e)
    this.setData({
      listShow: !this.data.listShow
    })
  },
  bindTapChoose: function (e) {
    console.log('bindTapChoose')
    console.log(e)
    this.setData({
      audioIndex: parseInt(e.currentTarget.id, 10),
      listShow: false
    })
    let that = this
    setTimeout(() => {
      if (that.data.pauseStatus === false) {
        that.play()
      }
    }, 1000)
    wx.setStorageSync('audioIndex', parseInt(e.currentTarget.id, 10))
  },
  play() {
    let {
      audioList,
      audioIndex
    } = this.data
    // wx.playBackgroundAudio({
    //   dataUrl: audioList[audioIndex].src,
    //   title: audioList[audioIndex].name,
    //   coverImgUrl: audioList[audioIndex].poster
    // })
    backgroundAudioManager.title = audioList[audioIndex].name
    backgroundAudioManager.coverImgUrl = audioList[audioIndex].poster
    console.log(audioIndex)
    backgroundAudioManager.src = audioList[audioIndex].src
    backgroundAudioManager.onPrev(() => {
      console.log(this.data)
      let length = this.data.audioSize
      if (audioIndex === 0) {
        audioIndex = length
      }
      this.setData({
        audioIndex: --audioIndex
      })
      console.log(audioIndex)
      backgroundAudioManager.src = audioList[audioIndex].src
      backgroundAudioManager.title = audioList[audioIndex].name
      backgroundAudioManager.coverImgUrl = audioList[audioIndex].poster
      console.log('上一曲')
    })
    backgroundAudioManager.onNext(() => {
      let length = this.data.audioSize
      if (audioIndex === length - 1) {
        audioIndex = -1;
      }
      this.setData({
        audioIndex: ++audioIndex
      })
      backgroundAudioManager.src = audioList[audioIndex].src
      backgroundAudioManager.title = audioList[audioIndex].name
      backgroundAudioManager.coverImgUrl = audioList[audioIndex].poster
      console.log('下一曲')
    })
    backgroundAudioManager.onEnded(() => {
      this.bindTapNext()
    })
    backgroundAudioManager.onError(() => {
      this.bindTapNext()
    })

    // backgroundAudioManager.onCanplay(() => {

    //   console.log("视频缓冲完毕，wx.createInnerAudioContext()的seek方法设置无效&小程序开发教程。可以播放啦~");
    //   console.log(backgroundAudioManager.title);
    //   wx.hideLoading()

    // })



    let that = this
    let timer = setInterval(function () {
      that.setDuration(that)
      // console.log(timer)
    }, 1000)
    // console.log(timer)
    this.setData({
      timer: timer
    })

  },

  setDuration(that) {
    wx.getBackgroundAudioPlayerState({
      success: function (res) {
        // console.log(res)
        let {
          status,
          duration,
          currentPosition
        } = res
        // console.log(currentPosition);
        if (status === 1 || status === 0) {
          that.setData({
            currentPosition: that.stotime(currentPosition),
            duration: that.stotime(duration),
            sliderValue: Math.floor(currentPosition * 100 / duration),
            audioPalyStatus: status,
          })
        }
        that.setData({
          audioPalyStatus: status
        })
      }
    })
  },
  stotime: function (s) {
    let t = '';
    if (s > -1) {
      // let hour = Math.floor(s / 3600);
      let min = Math.floor(s / 60) % 60;
      let sec = Math.ceil(s % 60);
      // if (hour < 10) {
      //   t = '0' + hour + ":";
      // } else {
      //   t = hour + ":";
      // }

      if (min < 10) {
        t += "0";
      }
      t += min + ":";
      if (sec < 10) {
        t += "0";
      }
      t += sec;
    }
    return t;
  },
  onShareAppMessage: function () {
    let that = this
    let params = 'name=' + that.data.audioList[that.data.audioIndex].name
    params += '&poster=' + that.data.audioList[that.data.audioIndex].poster
    params += '&src=' + that.data.audioList[that.data.audioIndex].src
    return {
      title: '我发现了学习中医里《' + that.data.audioList[that.data.audioIndex].name + '》知识的好方法, 赶紧来！',
      path: '/pages/index/index?author=&' + params,
      success: function (res) {
        wx.showToast({
          title: '分享成功',
          icon: 'success',
          duration: 2000
        })
      },
      fail: function (res) {
        wx.showToast({
          title: '分享失败',
          icon: 'cancel',
          duration: 2000
        })
      }
    }
  },
  binderrorimg: function (e) {
    var errorImgIndex = e.target.dataset.errorimg //获取循环的下标
    console.log("errorImgIndex:" + errorImgIndex)
    console.log("poster:" + this.data.audioList[errorImgIndex].poster)
    this.data.audioList[errorImgIndex].poster = "https://file.bywei.cn/music/chuhe/cover.jpg"
  },
  scrollLoadMore: function (e) {
    let thats = this
    let length = this.data.audioList.length
    let audioSize = this.data.audioSize
    let pageSize = parseInt(length / audioSize) + 1

    if (!this.data.hasMore) return
    thats.setData({
      loadHidden: false
    });

    wx.request({
      url: 'https://www.bywei.cn/upload/wukong/data.json',
      data: {
        pageSize: pageSize,
        userInfo: JSON.stringify(app.globalData.userInfo)
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log("load up length begin:" + thats.data.audioList.length)
        if (res.data.length > 0) {
          let updata = thats.data.audioList.concat(res.data)
          thats.setData({
            audioList: updata
          })
          length = thats.data.audioList.length
          thats.setData({
            hasMore: false
          });
        }
        thats.setData({
          loadHidden: true
        });
        console.log("load up length end:" + thats.data.audioList.length)
      }
    })
  },
  goQuestion: function (e) {
    console.log('open webview page')
    wx.navigateTo({
      url: '../webview/index',
      success: function (e) {
        console.log(e)
      }
    })
  },

  tap_ch: function (e) {
    if (this.data.open) {
      this.setData({
        translate: 'transform: translateX(0px)'
      })
      this.data.open = false;
    } else {
      this.setData({
        translate: 'transform: translateX(' + this.data.windowWidth * 0.75 + 'px)'
      })
      this.data.open = true;
    }
  }
  
})

