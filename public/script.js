const socket = io('/')
const videoGrid = document.getElementById('video-grid')
var myvideo = document.createElement('video')
myvideo.muted = true
var peers = []

var peer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '3030',
})

let myVideoStream

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: false,
  })
  .then((stream) => {
    myVideoStream = stream
    addVideoStream(myvideo, stream)

    peer.on('call', (call) => {
      call.answer(stream)
      const video = document.createElement('video')
      call.on('stream', (userVideoStream) => {
        // console.log(userVideoStream);
        addVideoStream(video, userVideoStream)
      })
    })

    socket.on('user-connected', (userId) => {
      connectToNewUser(userId, stream)
      console.log(peers.length)
    })

    socket.on('user-disconnected', userId => {
      if (peers[userId]) peers[userId].close()
    })

    $('html').keydown((e) => {
      if (e.which === 13 && text.val().length !== 0) {
        console.log(text.val())

        socket.emit('message', text.val())
        text.val('')
      }
    })

    socket.on('createMessage', (message) => {
      console.log('Message logged:', message)
      $('.messages').append(
        `<li class="message"><b>User</b><br>${message}</li>`,
      )
      scrollBottom()
    })
  })

peer.on('open', (id) => {
  socket.emit('join-room', ROOM_ID, id)
})

const scrollBottom = () => {
  let d = $('.main__chat__window')
  d.scrollTop(d.prop('scrollHeight'))
}

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', (userVideoStream) => {
    addVideoStream(video, userVideoStream)
  })
}

const addVideoStream = (video, stream) => {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })

  videoGrid.append(video)
}

let text = $('input')

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false
    setUnMuteButton()
  } else {
    setMuteButton()
    myVideoStream.getAudioTracks()[0].enabled = true
  }
}

const offVideo = () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false
    setOffVideoButton()
  } else {
    setVideoButton()
    myVideoStream.getVideoTracks()[0].enabled = true
  }
}

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `

  document.querySelector('.main__mute__button').innerHTML = html
}

const setUnMuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `

  document.querySelector('.main__mute__button').innerHTML = html
}

const setVideoButton = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop</span>
  `

  document.querySelector('.main__stop__button').innerHTML = html
}

const setOffVideoButton = () => {
  const html = `
    <i class="unmute fas fa-video-slash"></i>
    <span>Play</span>
  `

  document.querySelector('.main__stop__button').innerHTML = html
}

const leave = () => {
  myvideo = ""
}

const copy = () => {
  var copyText = document.getElementById("roomid");

  copyText.select();
  // copyText.setSelectionRange(0, 99999); 

  document.execCommand("copy");
  var tooltip = document.getElementById("myTooltip");
  tooltip.innerHTML = "Copied: " + copyText.value;
}

const out = () => {
  var tooltip = document.getElementById("myTooltip");
  tooltip.innerHTML = "Copy Room ID";
}

$(".toggle").click(function(){
  $(".main__right").toggleClass("none")
  $(".main__left").toggleClass("full")
});