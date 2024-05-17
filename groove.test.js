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
