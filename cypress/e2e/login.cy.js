/// <reference types="cypress" />
/// <reference types="cypress-file-upload" />

const filePath = 'F:/autoTest/PinturaWeb/cypress/fixtures/pictures'
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'];

 /**
   * 异步读取指定目录下的所有图片文件。
   * 
   * @param {string} dir - 需要读取的目录路径。
   * @returns {Promise<string[]>} - 返回一个包含所有图片文件名的数组。
   */
 async function getLocalFile (dir) {
  try{
    const fs = require('fs').promises  // cypress是运行在浏览器中的，而不是node环境，fs是node模块需要在node环境才能运行
    const path = require('path')
    console.log("dir", dir)
    console.log("fs.promises", fs)
    // 异步读取目录内容
    const files = await fs.readdir(dir)
    // 过滤出图片文件
    const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    console.error("ext", ext, "imageFiles", imageFiles)
    return imageExtensions.includes(ext);
    });
    // 打印或返回图片文件列表
    console.log('找到的图片文件：');
    imageFiles.forEach((file, index) => {
      console.log(`${index + 1}. ${file}`);
    });

    return imageFiles;

  } catch(error) {
    console.error("读取文件发生错误", error)
  }
}

describe('Pintura web 测试', () => {
  const language = 'en'  // zh 中文模式测hi， en 英文模式测试
  const languageButton = language == 'zh' ? '中文' : 'English'
  const region = 'China' // 需要指定登录地区进行测试 China中国, USA美国
  const regionButton = languageButton == '中文' ? region == 'China' ? '中国' : '美国' : region == 'China' ? 'China' : 'English'
  const areaCode = languageButton == '中文' ? region == 'China' ? '中国' : '美国' : region == 'China' ? 'China' : 'United States'
  const account = '15250996938'
  const correctPasswd = 'sf19960408'
  const passwdLocal = language === 'zh' ? '请填写密码' : 'Please enter the password'
  const logOutButtonText = language === 'zh' ? '退出登录' : 'Sign out'
  const env = 'test-cn'; // 国内测试环境：test-cn, 国外测试环境：test-en, 国内正式环境：prod-cn, 国外正式环境：prod-en
  const baseUrl = env == 'test-cn' ? 'http://139.224.192.36:8082/' : env == 'prod-cn' ? 'http://cloud-service.austinelec.com:8080/' : env == 'test-en' ? 'http://cloud-service-us.austinelec.com:8080/' : 'http://18.215.241.226:8082/'

  let token;
  let login;
  let api;
  let headers = {};
  
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
      // 获取接口
      cy.fixture('api').then(
        (apiarg) => {
          api = apiarg
        }
      )
      cy.visit('http://139.224.192.36:8000/')
      cy.get('span').contains(/Language|语言/).click()
      cy.get('li').contains(languageButton).click()
      cy.get('.el-dropdown-link').eq(1).click(); // 匹配包含 class "el-tooltip__trigger" 的元素
      cy.get('li').contains(regionButton).click()


      // 设置测试分辨率
      cy.viewport(1920, 1080)
    }
  )

  describe('登录测试', () => {
    it("手机账号登录-case1", () => {
      cy.get('.icon-wrapper > :nth-child(2)').click()
      cy.get('.search-input').click().type(areaCode)
      cy.get('[data-index="0"]').click()
      cy.get('div[class="el-input__wrapper"][tabindex="-1"]').eq(0).click().type(login.case1.account)
      cy.get(`input[placeholder="${passwdLocal}"]`).click().type(login.case1.passwd)
      cy.get('button[type="button"][class="el-button el-button--primary el-button--large"]').click()
      cy.get('.user-avatar').click()
      cy.get('span').contains(logOutButtonText).click()
      cy.get('.el-button--primary').click()
    })

    it("不填写账号填写密码-case2", () => {
      cy.get('.icon-wrapper > :nth-child(2)').click()
      cy.get('.search-input').click().type(areaCode)
      cy.get('[data-index="0"]').click()
      cy.get(`input[placeholder="${passwdLocal}"]`).click().type(login.case2.passwd)
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
      cy.get(`input[placeholder="${passwdLocal}"]`).click().type(login.case1.passwd)
      const except = transLateText(login.case4)
      cy.get('div').contains(except) // 期望弹出 账号不正确的提示
      cy.get('button').eq(0).should('have.attr', 'disabled') // 登录按钮不可点击
    })

    it("输入未注册的手机号进行登录-case5", () => {
      cy.get('.icon-wrapper > :nth-child(2)').click()
      cy.get('.search-input').click().type(areaCode)
      cy.get('[data-index="0"]').click()
      cy.get('div[class="el-input__wrapper"][tabindex="-1"]').eq(0).click().type(login.case5.account)
      cy.get(`input[placeholder="${passwdLocal}"]`).click().type(login.case5.passwd)
      cy.get('button[type="button"][class="el-button el-button--primary el-button--large"]').click()
      const except = transLateText(login.case5)
      cy.get('p').contains(except) //提示用户不存在
    })

    it("输入符合格式但错误的密码进行登录-case6", () => {
      cy.get('.icon-wrapper > :nth-child(2)').click()
      cy.get('.search-input').click().type(areaCode)
      cy.get('[data-index="0"]').click()
      cy.get('div[class="el-input__wrapper"][tabindex="-1"]').eq(0).click().type(login.case6.account)
      cy.get(`input[placeholder="${passwdLocal}"]`).click().type(login.case6.passwd)
      cy.get('button[type="button"][class="el-button el-button--primary el-button--large"]').click()
      const except = transLateText(login.case6)
      cy.get('p').contains(except) //期望有错误提示
    })

    it("输入密码格式正确的密码进行登录-case7", () => {
      cy.get('.icon-wrapper > :nth-child(2)').click()
      cy.get('.search-input').click().type(areaCode)
      cy.get('[data-index="0"]').click()
      cy.get('div[class="el-input__wrapper"][tabindex="-1"]').eq(0).click().type(login.case7.account)
      cy.get(`input[placeholder="${passwdLocal}"]`).click().type(login.case7.passwd)
      cy.get('button').eq(0).should('have.attr', 'disabled')
      const except = transLateText(login.case7)
      cy.get('div').contains(except) //期望有错误提示
    })

    it("勾选记住密码登录后退出登录，再次不输入任何信息直接点击登录-case8", () => {
      cy.get('.icon-wrapper > :nth-child(2)').click()
      cy.get('.search-input').click().type(areaCode)
      cy.get('[data-index="0"]').click()
      cy.get('div[class="el-input__wrapper"][tabindex="-1"]').eq(0).click().type(login.case8.account)
      cy.get(`input[placeholder="${passwdLocal}"]`).click().type(login.case8.passwd)
      cy.get('.el-checkbox__inner').click()
      cy.get('button[type="button"][class="el-button el-button--primary el-button--large"]').click()
      cy.get('.user-avatar').click()
      cy.get('span').contains(logOutButtonText).click()
      cy.get('.el-button--primary').click()
      cy.get('button[type="button"][class="el-button el-button--primary el-button--large"]').click()
      cy.get('.user-avatar').should('exist') // 再次直接进入登录界面，不需要输入密码
    })

    it("取消勾选记住密码登录后退出登录，再次不输入任何信息直接点击登录-case9", () => {
      cy.get('.icon-wrapper > :nth-child(2)').click()
      cy.get('.search-input').click().type(areaCode)
      cy.get('[data-index="0"]').click()
      cy.get('div[class="el-input__wrapper"][tabindex="-1"]').eq(0).click().type(login.case9.account)
      cy.get(`input[placeholder="${passwdLocal}"]`).click().type(login.case9.passwd)
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

    it("使用邮箱进行登录-case10", () => {
      cy.get('.el-tabs__item.is-top#tab-email').click()
      cy.get('.el-input__inner').eq(0).click().type(login.case10.account)
      cy.get('.el-input__inner').eq(1).click().type(login.case10.passwd)
      cy.get('button[type="button"][class="el-button el-button--primary el-button--large"]').click()
      cy.get('.user-avatar').should('exist')
    })

    it("不填写邮箱账号填写密码-case11", () => {
      cy.get('.el-tabs__item.is-top#tab-email').click()
      cy.get('input[type="password"]').click().type(login.case11.passwd)
      cy.get('button').eq(0).should('have.attr', 'disabled') // 登录按钮不可点击
    })

    it("邮箱登录不填写密码进行登录-case12", () => {
      cy.get('.el-tabs__item.is-top#tab-email').click()
      cy.get('input').eq(0).click().type(login.case12.account)
      cy.get('button').eq(0).should('have.attr', 'disabled') // 登录按钮不
    })

    it("输入错误的邮箱格式进行登录-case13", 
      () => {
        cy.get('.el-tabs__item.is-top#tab-email').click()
        cy.get('input').eq(0).click().type(login.case13.account)
        cy.get('input').eq(1).click().type(login.case13.passwd)
        cy.get('button').eq(0).should('have.attr', 'disabled') // 登录按钮不
        const except = transLateText(login.case13)
        cy.get('div').contains(except)
      }
    )

    it("输入未注册的邮箱进行登录-case14",
      () => {
        cy.get('.el-tabs__item.is-top#tab-email').click()
        cy.get('input').eq(0).click().type(login.case14.account)
        cy.get('input').eq(1).click().type(login.case14.passwd)
        cy.get('button').eq(0).click()
        const except = transLateText(login.case14)
        cy.get('p').contains(except)
      }
    )

    it("邮箱登录输入符合格式但错误的密码进行登录-case15", () => {
      cy.get('.el-tabs__item.is-top#tab-email').click()
      cy.get('input').eq(0).click().type(login.case15.account)
      cy.get('input').eq(1).click().type(login.case15.passwd)
      cy.get('button').eq(0).click()
      const except = transLateText(login.case15)
      cy.get('p').contains(except) //期望有错误提示
    })

    it("邮箱登录输入不正确的密码格式进行登录-case16", () => {
      cy.get('.el-tabs__item.is-top#tab-email').click()
      cy.get('input').eq(0).click().type(login.case16.account)
      cy.get('input').eq(1).click().type(login.case16.passwd)
      cy.get('button').eq(0).should('have.attr', 'disabled')
      const except = transLateText(login.case16)
      cy.get('div').contains(except) //期望有错误提示
      
    })

    it("邮箱登录勾选记住密码登录后退出登录，再次不输入任何信息直接点击登录-case17", () => {
      cy.get('.el-tabs__item.is-top#tab-email').click()
      cy.get('input').eq(0).click().type(login.case17.account)
      cy.get(`input[placeholder="${passwdLocal}"]`).click().type(login.case17.passwd)
      cy.get('.el-checkbox__input').then(($checkbox) => {
        const cb = $checkbox.get(0).classList
        if (cb.contains('is-checked')) {
          cy.get('.el-checkbox__inner').click()
        }
      }) //判断是否选中状态
      cy.get('.el-checkbox__inner').click()
      cy.get('button[type="button"][class="el-button el-button--primary el-button--large"]').click()
      cy.get('.user-avatar').click()
      cy.get('span').contains(logOutButtonText).click()
      cy.get('.el-button--primary').click()
      cy.get('button[type="button"][class="el-button el-button--primary el-button--large"]').click()
      cy.get('.user-avatar').should('exist') // 再次直接进入登录界面，不需要输入密码
    })

    it("邮箱登录勾选记住密码登录后退出登录，再次不输入任何信息直接点击登录-case18", () => {
      cy.get('.el-tabs__item.is-top#tab-email').click()
      cy.get('input').eq(0).click().type(login.case18.account)
      cy.get(`input[placeholder="${passwdLocal}"]`).click().type(login.case18.passwd)
      cy.get('.el-checkbox__input').then(($checkbox) => {
        const cb = $checkbox.get(0).classList
        if (cb.contains('is-checked')) {
        } else{
          cy.get('.el-checkbox__inner').click()
        }
      }) //判断是否选中状态
      cy.get('.el-checkbox__inner').click()
      cy.get('button[type="button"][class="el-button el-button--primary el-button--large"]').click()
      cy.get('.user-avatar').click()
      cy.get('span').contains(logOutButtonText).click()
      cy.get('.el-button--primary').click()
      cy.get('input').eq(0).should('not.contain.value') // 密码框没有值
      cy.get('button').eq(0).should('have.attr', 'disabled') // 登录按钮无法点击
    })

    it("点击用户协议显示用户协议文档-case19", 
      () => {
        const except = transLateText(login.case19)
        cy.get('a[href="javascript:void(0)"]').click().get('h4').contains(except)

      }
    )

    it("点击用户协议显示用户协议文档-case20", 
      () => {
        const except = transLateText(login.case20)
        cy.get('a[href="javascript:void(0)"]').siblings('a').should('exist').click().get('h4').contains(except)

      }
    )

  })

  describe('图库测试', () => {
    beforeEach('登录', () => {
      cy.get('.el-tabs__item.is-top#tab-email').click()
      cy.get('.el-input__inner').eq(0).click().type(login.case10.account)
      cy.get('.el-input__inner').eq(1).click().type(login.case10.passwd)
      cy.get('button[type="button"][class="el-button el-button--primary el-button--large"]').click()
      cy.get('.user-avatar').should('exist')
      cy.get(':nth-child(3) > a > .el-menu-item').should('exist').click()
      cy.window().then((window) => {
        token = window.localStorage.getItem('Admin-Token')
        headers['X-Token'] = token
      })
    })
    it('进入图库页面-case21', () => {
      cy.get('.el-scrollbar__view > .router-link-active').should('exist') //定位到图库toptab
    })

    it.only('创建云相册并上传图片-case22', () => {
      let picNum = 0;
      const body = {
        "pageNum": 1,
        "pageSize": 50
      }
      cy.get('.el-button').click()
      cy.get('.el-input__wrapper').click().type(login.case22.albumName)
      // 拦截创建相册接口，获取响应中的相册id
      cy.intercept('POST', `${baseUrl}${api.createAlbum}`, (req) => {
      }).as('createAlbum')
      // 点击上传按钮
      cy.get('.dialog-footer > .el-button--primary').click()
      // 从响应中获取id
      cy.wait('@createAlbum', { timeout: 1000 }).then((interception) => {
        body.albumId = interception.response.body.data
        console.log("body===>", body)
      })
      
      
      cy.get('.router-link-active').should('exist') // 出现新建相册的标签代表创建成功
      cy.get('.icon-add').click()
      cy.get('input[type="file"]').should('have.attr', 'accept', '.jpg,.jpeg,.JPG,.JPEG,.heic,.png')
      cy.get('input[type="file"]').should(($attr) => {
        const attr = $attr.attr('accept')
        expect(attr).to.equal('.jpg,.jpeg,.JPG,.JPEG,.heic,.png')
      }) // 验证文件输入时的文件格式是否限制
      // 读取本地夹具文件
      // cy.readFile(filePath).then((file) => {
      //   console.log("file", file)
      // })
      // 使用 Cypress 的文件上传机制
      // cy.get('input[type="file"]').attachFile('pictures/1.jpg')
      let fileLength;
      cy.task('readImageFilesFromDir', filePath).then((files) => {
        if (files) {
          fileLength = files.length;
          // 使用找到的文件进行上传
          cy.get('input[type="file"]').attachFile(files.map(file => `pictures/${file}`));
          // 点击上传按钮
          cy.get('.iconfont').click();
          cy.get('.el-loading-mask', { timeout: 100000 }).should('not.exist');
          // 进行后续断言
          const except = transLateText(login.case22);
          cy.get('.el-message__content', { timeout: 60000 }).should('exist').contains(except);
          cy.request({
            url: `${baseUrl}${api.getAlbumPic}`,
            method: 'GET',
            headers: headers,
            qs: body
          }).then ((res) => {
            picNum = res.body.data.total
          })
          // 拦截请求
          const requestAliases = [];
          cy.intercept('GET', 'http://139.224.192.36:8082/api/v1/photo/album/*', (req) => {
            const alias = `request${requestAliases.length}`;
            requestAliases.push(alias);
            req.alias = alias;
          }).as('allAlbumListRequests');
          
          // 等待所有请求完成
          cy.wrap(requestAliases).each((alias) => {
            cy.wait(`@${alias}`, { timeout: 15000 }).then((interception) => {
              expect(interception.response.statusCode).to.eq(200);
            });
          }).then(
            () => {
              console.log("picNum===>", picNum)
              debugger
              const pageNum = Math.ceil(picNum / 32)
              for (let i = 0; i < pageNum; i++) {
                // 滚动和检查
                cy.get('.upload-box.infinite-list').scrollTo('bottom');
                cy.wait(5000);
              }
              cy.get('div[data-index]').should('have.length', fileLength); // 断言界面显示的数量与上传的数量一致。但是图片多了无法验证，因为这边只滚动一次，有多页内容的时候就无法判断了，需要每上传一次就滚动一次
            }
          );
          
          
          
          
          
        }
      });
    })
  })
})