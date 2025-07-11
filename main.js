document.addEventListener('DOMContentLoaded', function () {
  // 비밀번호 찾기(재설정) 인증 및 변경 이벤트 처리
  // 변수명 간략화
  const btnVerify = document.getElementById('findpw-verify-code')
  const btnReset = document.getElementById('findpw-reset-btn')
  const boxNewPw = document.getElementById('findpw-newpw-box')

  if (btnVerify) {
    btnVerify.addEventListener('click', async () => {
      const id = document.getElementById('findpw-id').value
      const email = document.getElementById('findpw-email').value
      const code = document.getElementById('findpw-code').value
      if (!id || !email || !code)
        return alert('아이디, 이메일, 인증코드를 모두 입력하세요.')
      const res = await fetch('/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iduser: id, email, code }),
      })
      const data = await res.json()
      alert(data.message || data.error)
      if (res.ok && data.message && data.message.includes('성공')) {
        // 인증 성공 시 새 비밀번호 입력란 표시
        if (boxNewPw) boxNewPw.style.display = 'block'
        // 인증 타이머 숨기기
        const timer = document.getElementById('findpw-email-timer')
        if (timer) timer.style.display = 'none'
        if (typeof findpwEmailTimer !== 'undefined' && findpwEmailTimer) {
          clearInterval(findpwEmailTimer)
        }
      }
    })
  }

  if (btnReset) {
    btnReset.addEventListener('click', async () => {
      const id = document.getElementById('findpw-id').value
      const email = document.getElementById('findpw-email').value
      const newpw = document.getElementById('findpw-newpw').value
      if (!id || !email || !newpw)
        return alert('아이디, 이메일, 새 비밀번호를 모두 입력하세요.')
      const res = await fetch('/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iduser: id, email, newPassword: newpw }),
      })
      const data = await res.json()
      alert(data.message || data.error)
      if (res.ok && data.message && data.message.includes('변경')) {
        // 성공 시 폼 리셋 및 새 비밀번호 입력란 숨김
        document.getElementById('findpw-form').reset()
        if (boxNewPw) boxNewPw.style.display = 'none'
      }
    })
  }
  // 피라미드 생성을 위한 클래스 정의
  class Pyramid {
    // 생성자: 피라미드의 모양, 반복 횟수, 공백을 설정
    constructor(shape, count, space) {
      this.shape = shape // 피라미드에 사용할 문자 (예: '*', 'ㅁ')
      this.count = count // 피라미드의 높이 (줄 수)
      this.space = space // 각 줄의 왼쪽 공백
    }

    // 피라미드를 생성하고 HTML에 표시하는 메서드
    makePyramid() {
      let py = '' // 피라미드 문자열을 저장할 변수
      for (let i = 0; i < this.count; i++) {
        // 각 줄 반복
        for (let j = 0; j < this.count - 1 - i; j++) {
          // 왼쪽 공백 추가
          py += this.space
        }
        for (let k = 1; k <= i * 2 - 1; k++) {
          // 모양 문자 추가
          py += this.shape
        }
        py += '<br>' // 줄 바꿈
      }
      // 'py' ID를 가진 요소에 피라미드 출력
      document.getElementById('py').innerHTML = py
    }
  }

  // 다양한 피라미드 객체 생성
  const pm1 = new Pyramid('ㅁ', 5, '\u00a0\u00a0\u00a0\u00a0') // 'ㅁ' 모양, 5줄
  const pm2 = new Pyramid('*', 8, '\u00a0\u00a0') // '*' 모양, 8줄
  const pm3 = new Pyramid('O', 10, '\u00a0\u00a0\u00a0') // 'O' 모양, 10줄
  const pm4 = new Pyramid('🧱', 15, '\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0') // '🧱' 모양, 15줄

  // 로그인 폼 제출 이벤트 처리
  document
    .getElementById('login-form')
    ?.addEventListener('submit', async (e) => {
      e.preventDefault() // 폼의 기본 제출 동작(페이지 새로고침) 방지
      const iduser = document.getElementById('userID').value // 입력된 ID
      const userpw = document.getElementById('pw').value // 입력된 비밀번호

      try {
        // 서버에 POST /login 요청 보내기
        const response = await fetch('/login', {
          method: 'POST', // POST 메서드 사용
          headers: { 'Content-Type': 'application/json' }, // JSON 형식으로 전송
          body: JSON.stringify({ iduser, userpw }),
        })
        const result = await response.json() // 서버 응답을 JSON으로 파싱
        alert(result.message || result.error) // 성공/에러 메시지를 alert로 표시
        if (response.ok && result.redirect) {
          // 요청 성공이고 리디렉션 경로가 있으면
          window.location.href = result.redirect // 지정된 페이지로 이동
        }
      } catch (err) {
        alert('서버와의 연결에 실패했습니다.') // 네트워크 에러 시 alert 표시
      }
    })

  // 이메일 인증 코드 전송 및 확인 이벤트 처리
  // (중복 이벤트 방지: 아래에서 한 번만 등록)

  const signupVerifyBtn = document.getElementById('verify-code-btn')
  if (signupVerifyBtn) {
    signupVerifyBtn.addEventListener('click', async () => {
      const email = document.getElementById('email').value
      const code = document.getElementById('emailCode').value
      if (!email || !code) return alert('이메일과 인증코드를 입력하세요.')
      const res = await fetch('/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })
      const data = await res.json()
      alert(data.message || data.error)
      if (res.ok && data.message && data.message.includes('성공')) {
        // 인증 성공 시 이메일 입력란을 readonly로 변경
        const emailInput = document.getElementById('email')
        if (emailInput) {
          emailInput.readOnly = true
          emailInput.style.background = '#e6ffe6'
        }
        // 인증완료 안내 메시지 표시
        let verifyMsg = document.getElementById('email-verified-msg')
        if (!verifyMsg) {
          verifyMsg = document.createElement('div')
          verifyMsg.id = 'email-verified-msg'
          verifyMsg.style.color = '#1a7e1a'
          verifyMsg.style.fontSize = '14px'
          verifyMsg.style.margin = '4px 0 8px 0'
          emailInput.parentNode.insertBefore(verifyMsg, emailInput.nextSibling)
        }
        verifyMsg.textContent = '이메일 인증이 완료되었습니다.'
        // 인증 성공 시 타이머 숨기기 및 중지
        const timerElem = document.getElementById('email-timer')
        if (timerElem) {
          timerElem.style.display = 'none'
        }
        if (typeof emailTimer !== 'undefined' && emailTimer) {
          clearInterval(emailTimer)
        }
      }
    })
  }

  // 회원가입 폼 제출 이벤트 처리
  document
    .getElementById('signup-form')
    ?.addEventListener('submit', async (e) => {
      e.preventDefault() // 폼의 기본 제출 동작 방지
      const iduser = document.getElementById('userID').value // 입력된 ID
      const userpw = document.getElementById('pw').value // 입력된 비밀번호
      const email = document.getElementById('email').value // 입력된 이메일

      try {
        // 서버에 POST /signup 요청 보내기
        const response = await fetch('/signup', {
          method: 'POST', // POST 메서드 사용
          headers: { 'Content-Type': 'application/json' }, // JSON 형식으로 전송
          body: JSON.stringify({ iduser, userpw, email }), // ID, 비밀번호, 이메일을 JSON으로 변환
        })
        const result = await response.json() // 서버 응답을 JSON으로 파싱
        alert(result.message || result.error) // 성공/에러 메시지를 alert로 표시
        if (response.ok && result.redirect) {
          // 요청 성공이고 리디렉션 경로가 있으면
          window.location.href = result.redirect // 지정된 페이지로 이동
        }
      } catch (err) {
        alert('서버와의 연결에 실패했습니다.') // 네트워크 에러 시 alert 표시
      }
    })

  // 로그아웃 함수
  async function Logout() {
    if (confirm('로그아웃 하시겠습니까?')) {
      // 사용자 확인
      try {
        // 서버에 GET /logout 요청 보내기
        const response = await fetch('/logout')
        const result = await response.json() // 서버 응답을 JSON으로 파싱
        alert(result.message) // 로그아웃 메시지 표시
        if (result.redirect) {
          // 리디렉션 경로가 있으면
          window.location.href = result.redirect // 지정된 페이지로 이동
        }
      } catch (err) {
        alert('서버와의 연결에 실패했습니다.') // 네트워크 에러 시 alert 표시
      }
    }
  }

  // 회원탈퇴 함수
  async function Delete() {
    if (confirm('정말 회원탈퇴를 진행하시겠습니까?')) {
      // 사용자 확인
      try {
        // 서버에 DELETE /user 요청 보내기
        const response = await fetch('/user', { method: 'DELETE' })
        const result = await response.json() // 서버 응답을 JSON으로 파싱
        alert(result.message) // 회원탈퇴 메시지 표시
        if (result.redirect) {
          // 리디렉션 경로가 있으면
          window.location.href = result.redirect // 지정된 페이지로 이동
        }
      } catch (err) {
        alert('서버와의 연결에 실패했습니다.') // 네트워크 에러 시 alert 표시
      }
    }
  }

  // 피라미드 페이지로 이동 함수
  function Pyramid_location() {
    if (confirm('피라미드 페이지로 이동하시겠습니까?')) {
      // 사용자 확인
      window.location.href = '/pyramid.html' // 피라미드 페이지로 이동
    }
  }

  // 로그인페이지로 이동 함수
  function Login_location() {
    window.location.href = '/main.html'
  }

  // 테마 적용 함수: 서버에서 theme 값을 받아 body에 적용
  async function applyThemeFromServer() {
    try {
      const res = await fetch('/theme', { credentials: 'same-origin' }) // 테마 정보 요청
      const data = await res.json()
      setTheme(data.theme || 'light')
    } catch (e) {
      // 에러 발생시 라이트테마
      setTheme('light')
    }
  }

  // 테마 적용 함수: body 클래스와 아이콘 변경
  function setTheme(theme) {
    document.body.classList.toggle('dark', theme === 'dark')
    const icon = document.getElementById('theme-icon')
    if (icon) {
      icon.src = theme === 'dark' ? 'img/sun.png' : 'img/moon.png'
    }
  }

  // 테마 토글 버튼 이벤트
  const themeBtn = document.getElementById('theme-toggle')
  if (themeBtn) {
    themeBtn.addEventListener('click', async (e) => {
      e.preventDefault()
      const isDark = document.body.classList.contains('dark')
      const newTheme = isDark ? 'light' : 'dark'
      setTheme(newTheme)
      // 서버에 테마 저장 (응답 확인 및 에러 처리 추가)
      try {
        const res = await fetch('/theme', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin', // 쿠키전송
          body: JSON.stringify({ theme: newTheme }),
        })
        if (!res.ok) {
          const data = await res.json()
          alert('테마 저장 실패: ' + (data.error || res.status))
        }
      } catch (err) {
        alert('서버와의 연결에 실패했습니다.')
      }
    })
  }

  // 페이지 로드 시 서버에서 테마 적용
  applyThemeFromServer()

  // 비밀번호 찾기(이메일 인증 기반) 기능
  let findpwEmailTimer = null
  let findpwEmailTimeLeft = 180

  function startFindpwEmailTimer() {
    clearInterval(findpwEmailTimer)
    findpwEmailTimeLeft = 180
    const timerElem = document.getElementById('findpw-email-timer')
    timerElem.textContent = `남은 시간: ${findpwEmailTimeLeft}초`
    findpwEmailTimer = setInterval(() => {
      findpwEmailTimeLeft--
      timerElem.textContent = `남은 시간: ${findpwEmailTimeLeft}초`
      if (findpwEmailTimeLeft <= 0) {
        clearInterval(findpwEmailTimer)
        timerElem.textContent = '인증코드가 만료되었습니다.'
      }
    }, 1000)
  }

  // 인증코드 발송/재발송 버튼 변수명 간략화
  const btnSend = document.getElementById('findpw-send-code')
  const btnResend = document.getElementById('findpw-resend-code')
  if (btnSend && btnResend) {
    const newSend = btnSend.cloneNode(true)
    newSend.id = 'findpw-send-code'
    btnSend.parentNode.replaceChild(newSend, btnSend)
    const newResend = btnResend.cloneNode(true)
    newResend.id = 'findpw-resend-code'
    btnResend.parentNode.replaceChild(newResend, btnResend)

    newSend.addEventListener('click', async (e) => {
      e.preventDefault()
      const id = document.getElementById('findpw-id').value
      const email = document.getElementById('findpw-email').value
      if (!id) return alert('아이디를 입력하세요.')
      if (!email) return alert('이메일을 입력하세요.')
      const res = await fetch('/send-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iduser: id, email }),
      })
      const data = await res.json()
      alert(data.message || data.error)
      newSend.disabled = true
      newSend.style.display = 'none'
      newResend.style.display = 'inline-block'
      newResend.disabled = false
      startFindpwEmailTimer()
    })

    newResend.addEventListener('click', async (e) => {
      e.preventDefault()
      const id = document.getElementById('findpw-id').value
      const email = document.getElementById('findpw-email').value
      if (!id) return alert('아이디를 입력하세요.')
      if (!email) return alert('이메일을 입력하세요.')
      const res = await fetch('/send-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iduser: id, email }),
      })
      const data = await res.json()
      alert(data.message || data.error)
      startFindpwEmailTimer()
    })
  }

  // 이메일 인증 타이머 및 버튼 상태 관리
  let emailTimer = null
  let emailTimeLeft = 180 // 3분

  function startEmailTimer() {
    clearInterval(emailTimer)
    emailTimeLeft = 180
    const timerElem = document.getElementById('email-timer')
    timerElem.textContent = `남은 시간: ${emailTimeLeft}초`
    emailTimer = setInterval(() => {
      emailTimeLeft--
      timerElem.textContent = `남은 시간: ${emailTimeLeft}초`
      if (emailTimeLeft <= 0) {
        clearInterval(emailTimer)
        timerElem.textContent = '인증코드가 만료되었습니다.'
      }
    }, 1000)
  }

  const sendCodeBtn = document.getElementById('send-code-btn')
  const resendCodeBtn = document.getElementById('resend-code-btn')

  if (sendCodeBtn && resendCodeBtn) {
    // 기존 이벤트 리스너 제거를 위해 버튼을 복제 후 교체 (중복 방지)
    const newSendBtn = sendCodeBtn.cloneNode(true)
    sendCodeBtn.parentNode.replaceChild(newSendBtn, sendCodeBtn)
    const newResendBtn = resendCodeBtn.cloneNode(true)
    resendCodeBtn.parentNode.replaceChild(newResendBtn, resendCodeBtn)

    newSendBtn.addEventListener('click', async () => {
      const email = document.getElementById('email').value
      if (!email) return alert('이메일을 입력하세요.')
      const res = await fetch('/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      alert(data.message || data.error)
      // 버튼 상태 변경
      newSendBtn.disabled = true
      newSendBtn.style.display = 'none'
      newResendBtn.style.display = 'inline-block'
      newResendBtn.disabled = false
      startEmailTimer()
    })

    newResendBtn.addEventListener('click', async () => {
      const email = document.getElementById('email').value
      if (!email) return alert('이메일을 입력하세요.')
      const res = await fetch('/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      alert(data.message || data.error)
      // 재발송 시 타이머 리셋, 기존 코드 만료(백엔드에서 처리)
      startEmailTimer()
    })
  }
})
