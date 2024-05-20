const request = require('supertest');
const app = require('./app');
const mongoose = require('mongoose');
const User = require('./models/users');

const newUser = { username: 'test', email:'fake@email.com', password: 'test123' };

it('POST /users', async () => {
    const res = await request(app).post('/users/signup').send({
      pseudo: 'Alex',
      email : "conrattealex@gmail.com",
      password : "youpi"
     /* phone: '',
      firstName: '',
      Name : '',
      birthDate: '',
      city: ''  */
    });
   
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.pseudo).toBe('Alex');
    expect(res.body.email).toBe('conrattealex@gmail.com');
    expect(res.body.token).toEqual(expect.any(String))
    expect(res.body.token.length).toBe(32)

    expect(res.body.phone).toBe('');
    expect(res.body.firstName).toBe('');
    expect(res.body.birthDate).toBe('');
    expect(res.body.city).toBe(''); 
    expect(res.body.phone).toBe('');
    expect(res.body.firstName).toBe('');
    expect(res.body.birthDa).toBe('');
    expect(res.body.city).toBe(''); 
   });



it('Get /users/findLiked', async () => { 
  const res = await request(app).post('/users/signup').send(newUser);
  expect(res.statusCode).toBe(200);
  expect(res.body.result).toBe(true);
  expect(res.body.token).toEqual(expect.any(String));

  const res2 = await request(app).get('festival/findPopular')
  expect(res2.statusCode).toBe(200);

  const res3 = await request(app).post('users/likeFest').send(res2.body.festivals[0]);
  expect(res3.statusCode).toBe(200);

  const res4 = await request(app).post('users/likeFest').send(res2.body.festivals[1]);
  expect(res4.statusCode).toBe(200);

  const res5 = await request(app).get(`users/findLiked/${res.body.token}`)
  expect(res5.statusCode).toBe(200);
  expect(res5.body.result).toBe(true);
  expect(res5.body.festivals.length).toEqual(2);
});