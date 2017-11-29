//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Song',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    voiceButtonName: '语音识别',
    voicePlayButtonName: '无录音',
    tempFilePath: null
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  tapVoicePlayButton: function (event) {
    var that = this
    var voicePlayButtonName = '无录音'
    var voiceButtonDisable = false
    switch (this.data.voicePlayButtonName) {
      case '无录音': {
        wx.showModal({
          title: '无录音',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定')
            }
          }
        })
        break
      }
      case '开始播放': {
        voicePlayButtonName = '结束播放'
        voiceButtonDisable = true
        wx.playVoice({
          filePath: this.data.tempFilePath,
          complete: function () {
            that.setData({
              voicePlayButtonName: '开始播放',
              voiceButtonDisable: false
            })
          }
        })
        break
      }
      case '结束播放': {
        voicePlayButtonName = '开始播放'
        wx.stopVoice()
        break
      }
    }
    this.setData({
      voicePlayButtonName: voicePlayButtonName,
      voiceButtonDisable: voiceButtonDisable
    })
  },

  tapVoiceButton: function (event) {
    var that = this
    var start = this.data.voiceButtonName == '语音识别';
    this.setData({
      voiceButtonName: start ? '结束录音' : '语音识别'
    })
    if (start) {
      wx.startRecord({
        success: function (res) {
          console.log('录音成功' + JSON.stringify(res));
          that.setData({
            voiceButtonName: '语音识别',
            voicePlayButtonName: '开始播放',
            tempFilePath: res.tempFilePath
          })
          wx.showToast({
            title: '语音识别中',
            icon: 'loading',
            duration: 10000,
            mask: true
          })
          wx.uploadFile({
            url: 'https://pianotranscription.mamasousuo.com/UploadVoice',
            filePath: res.tempFilePath,
            name: 'file',
            // header: {}, // 设置请求的 header
            formData: {
              'msg': 'voice'
            }, // HTTP 请求中其他额外的 form data
            success: function (res) {
              // success
              console.log('begin');
              console.log(res.data);
              // var json = JSON.parse(res.data);
              // console.log(json.msg);
              // var jsonMsg = JSON.parse(json.msg);
              // console.log(jsonMsg.result);
              wx.hideToast()
              // wx.navigateTo({
              //   url: '../voicePage/voicePage?voiceData=' + jsonMsg.result.join('')
              // })
            },
            fail: function (err) {
              // fail
              console.log(err);
            },
            complete: function () {
              // complete
            }
          })
        },
        fail: function (res) {
          //录音失败
          that.setData({
            voiceButtonName: '语音识别'
          })
          console.log('录音失败' + JSON.stringify(res));
        }
      })
      setTimeout(function () {
        //结束录音  
        wx.stopRecord()
      }, 60000)
    } else {
      wx.stopRecord()
    }
  },

  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
