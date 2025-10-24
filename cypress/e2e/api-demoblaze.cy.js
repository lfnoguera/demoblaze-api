describe('Pruebas API Demoblaze', () => {
  const baseUrl = 'https://api.demoblaze.com'

  const newUser = {
    username: 'user' + Date.now(),
    password: '123456'
  }

  it('Crear un nuevo usuario (signup)', () => {
    cy.request('POST', `${baseUrl}/signup`, newUser)
      .then((response) => {
        cy.log('Respuesta signup:', JSON.stringify(response.body))
        expect(response.status).to.eq(200)
        expect(response.body).to.be.empty
      })
  })

  it('Intentar crear un usuario ya existente', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/signup`,
      failOnStatusCode: false,
      body: newUser
    }).then((response) => {
      const bodyText = typeof response.body === 'object'
        ? JSON.stringify(response.body)
        : response.body
  
      cy.log('Respuesta usuario existente:', bodyText)
      expect(response.status).to.eq(200)
      expect(bodyText).to.include('This user already exist')
    })
  })

  it('Login con usuario y password correctos', () => {
    cy.request('POST', `${baseUrl}/login`, newUser)
      .then((response) => {
        cy.log('Respuesta login:', response.body)
        expect(response.status).to.eq(200)
        expect(response.body).to.contain('Auth_token:')
        const token = response.body.replace('Auth_token: ', '')
        cy.log('Token:', token)
        expect(token).to.have.length.greaterThan(10)
      })
  })
  it('Login con usuario y password incorrectos', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/login`,
      failOnStatusCode: false,
      body: {
        username: newUser.username,
        password: 'wrongpass'
      }
    }).then((response) => {
      const bodyText = typeof response.body === 'object'
        ? JSON.stringify(response.body)
        : response.body

      cy.log('Respuesta login incorrecto:', bodyText)
      expect(response.status).to.eq(200)
      expect(bodyText).to.include('Wrong password')
    })
  })
})
