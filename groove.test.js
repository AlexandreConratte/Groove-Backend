it('POST /users', async () => {
  const res = await request(app).post('/users/signup').send({
    pseudo: 'Alex',
    email: "conrattealex@gmail.com",
    password: "youpi"
  });

  expect(res.statusCode).toBe(200);
  expect(res.body.result).toBe(true);
  expect(res.body.pseudo).toBe('Alex');
  expect(res.body.email).toBe('conrattealex@gmail.com');
  expect(res.body.token).toEqual(expect.any(String))
  expect(res.body.token.length).toBe(32)
});


it('POST /users/addFriend', async () => {
  //créer un user
  const user = await request(app).post('/users/signup').send({
    pseudo: 'Test',
    email: "test.test@gmail.com",
    password: "Test1",
  });
  const token1 = user.result.token
//créer un user
  const user2 = await request(app).post('/users/signup').send({
    pseudo: 'Test2',
    email: "test2.test@gmail.com",
    password: "Test2",
  });
  const token2 = user2.result.token
//envoie le token de l'utilisateur qui ajoute un ami et le token de l'utilisateur à ajouter
  const res = await request(app).put('/users/addFriend').send({
    user:token1,
    friend:token2
  });

  expect(res.statusCode).toBe(200);
  expect(res.result).toBe(true);

//on verifie que le tableau des amis s'est incrémenté de 1
  const res2 = await request(app).get('/users/profile').send({
    user:token1,
  });
  expect(res2.result.friends.length).toBe(1);
});

