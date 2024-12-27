/// <reference types="cypress" />

describe('Pintura web 测试', () => {
  const language = 'zh'  // zh 中文模式测hi， en 英文模式测试
  const languageButton = language == 'zh' ? '中文' : 'English'
  const region = 'China' // 需要指定登录地区进行测试 China中国, USA美国
  const regionButton = languageButton == '中文' ? region == 'China' ? '中国' : '美国' : region == 'China' ? 'China' : 'English'
  const areaCode = languageButton == '中文' ? region == 'China' ? '中国' : '美国' : region == 'China' ? 'China' : 'United States'
  const account = '15250996938'
  const correctPasswd = 'sf19960408'
  const passwdLocal = language === 'zh' ? '请填写密码' : 'Please enter the password'
  const logOutButtonText = language === 'zh' ? '退出登录' : 'Sign out'
  let login;
  
  const transLateText = (cases) => {
    const isChinese = language == 'zh' ? true : false
    if(isChinese) {
      return cases.except
    } else {
      return cases.exceptEn
    }
  };

  beforeEach(
    () => {
      // 获取测试数据
      cy.fixture('login').then(
        (logintmp) => {
          login = logintmp
        }
      )
      cy.visit('http://139.224.192.36:8000/')
      cy.get('span').contains(/Language|语言/).click()
      cy.get('li').contains(languageButton).click()
      cy.get('.el-dropdown-link').eq(1).click(); // 匹配包含 class "el-tooltip__trigger" 的元素
      cy.get('li').contains(regionButton).click()
    }
  )

  describe('登录测试', () => {
    it("手机账号登录-case1", () => {
      cy.get('.icon-wrapper > :nth-child(2)').click()
      cy.get('.search-input').click().type(areaCode)
      cy.get('[data-index="0"]').click()
      cy.get('div[class="el-input__wrapper"][tabindex="-1"]').eq(0).click().type(login.case1.account)
      cy.get(`input[placeholder=${passwdLocal}]`).click().type(login.case1.passwd)
      cy.get('button[type="button"][class="el-button el-button--primary el-button--large"]').click()
      cy.get('.user-avatar').click()
      cy.get('span').contains(logOutButtonText).click()
      cy.get('.el-button--primary').click()
    })

    it("不填写账号填写密码-case2", () => {
      cy.get('.icon-wrapper > :nth-child(2)').click()
      cy.get('.search-input').click().type(areaCode)
      cy.get('[data-index="0"]').click()
      cy.get(`input[placeholder=${passwdLocal}]`).click().type(login.case2.passwd)
      cy.get('button').eq(0).should('have.attr', 'disabled') // 登录按钮不可点击
    })

    it("不填写密码进行登录-case3", () => {
      cy.get('.icon-wrapper > :nth-child(2)').click()
      cy.get('.search-input').click().type(areaCode)
      cy.get('[data-index="0"]').click()
      cy.get('div[class="el-input__wrapper"][tabindex="-1"]').eq(0).click().type(login.case3.account)
      cy.get('button').eq(0).should('have.attr', 'disabled') // 登录按钮不可点击
    })

    it("输入的手机号格式不正确-case4", () => {
      cy.get('.icon-wrapper > :nth-child(2)').click()
      cy.get('.search-input').click().type(areaCode)
      cy.get('[data-index="0"]').click()
      cy.get('div[class="el-input__wrapper"][tabindex="-1"]').eq(0).click().type(login.case4.account)
      cy.get(`input[placeholder=${passwdLocal}]`).click().type(login.case1.passwd)
      const except = transLateText(login.case4)
      cy.get('div').contains(except) // 期望弹出 账号不正确的提示
      cy.get('button').eq(0).should('have.attr', 'disabled') // 登录按钮不可点击
    })

    it("输入未注册的手机号进行登录-case5", () => {
      cy.get('.icon-wrapper > :nth-child(2)').click()
      cy.get('.search-input').click().type(areaCode)
      cy.get('[data-index="0"]').click()
      cy.get('div[class="el-input__wrapper"][tabindex="-1"]').eq(0).click().type(login.case5.account)
      cy.get(`input[placeholder=${passwdLocal}]`).click().type(login.case5.passwd)
      cy.get('button[type="button"][class="el-button el-button--primary el-button--large"]').click()
      const except = transLateText(login.case5)
      cy.get('p').contains(except) //提示用户不存在
    })

    it("输入符合格式但错误的密码进行登录-case6", () => {
      cy.get('.icon-wrapper > :nth-child(2)').click()
      cy.get('.search-input').click().type(areaCode)
      cy.get('[data-index="0"]').click()
      cy.get('div[class="el-input__wrapper"][tabindex="-1"]').eq(0).click().type(login.case6.account)
      cy.get(`input[placeholder=${passwdLocal}]`).click().type(login.case6.passwd)
      cy.get('button[type="button"][class="el-button el-button--primary el-button--large"]').click()
      const except = transLateText(login.case6)
      cy.get('p').contains(except) //期望有错误提示
    })

    it("输入密码格式正确的密码进行登录-case7", () => {
      cy.get('.icon-wrapper > :nth-child(2)').click()
      cy.get('.search-input').click().type(areaCode)
      cy.get('[data-index="0"]').click()
      cy.get('div[class="el-input__wrapper"][tabindex="-1"]').eq(0).click().type(login.case7.account)
      cy.get(`input[placeholder=${passwdLocal}]`).click().type(login.case7.passwd)
      cy.get('button').eq(0).should('have.attr', 'disabled')
      const except = transLateText(login.case7)
      cy.get('div').contains(except) //期望有错误提示
    })

    it("勾选记住密码登录后退出登录，再次不输入任何信息直接点击登录-case8", () => {
      cy.get('.icon-wrapper > :nth-child(2)').click()
      cy.get('.search-input').click().type(areaCode)
      cy.get('[data-index="0"]').click()
      cy.get('div[class="el-input__wrapper"][tabindex="-1"]').eq(0).click().type(login.case8.account)
      cy.get(`input[placeholder=${passwdLocal}]`).click().type(login.case8.passwd)
      cy.get('.el-checkbox__inner').click()
      cy.get('button[type="button"][class="el-button el-button--primary el-button--large"]').click()
      cy.get('.user-avatar').click()
      cy.get('span').contains(logOutButtonText).click()
      cy.get('.el-button--primary').click()
      cy.get('button[type="button"][class="el-button el-button--primary el-button--large"]').click()
      cy.get('.user-avatar').should('exist') // 再次直接进入登录界面，不需要输入密码
    })

    it.only("取消勾选记住密码登录后退出登录，再次不输入任何信息直接点击登录-case9", () => {
      cy.get('.icon-wrapper > :nth-child(2)').click()
      cy.get('.search-input').click().type(areaCode)
      cy.get('[data-index="0"]').click()
      cy.get('div[class="el-input__wrapper"][tabindex="-1"]').eq(0).click().type(login.case9.account)
      cy.get(`input[placeholder=${passwdLocal}]`).click().type(login.case9.passwd)
      cy.get('.el-checkbox__input').then(($checkbox) => {
        const cb = $checkbox.get(0).classList
        if (cb.contains('is-checked')) {
          cy.get('.el-checkbox__inner').click()
        }
      }) //判断是否选中状态
      cy.get('button[type="button"][class="el-button el-button--primary el-button--large"]').click()
      cy.get('.user-avatar').click()
      cy.get('span').contains(logOutButtonText).click()
      cy.get('.el-button--primary').click()
      cy.get('button').eq(0).should('have.attr', 'disabled') // 登录按钮不可点击
    })


  })

  

  
  
  
})