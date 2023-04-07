import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { getApp } from '../../testsConnection';
import { devicesConstants } from './public.devices.constants';

describe('Testing device public controller', () => {
  let app: INestApplication;
  let server: any;
  beforeAll(async () => {
    //connection:
    app = await getApp();
    server = app.getHttpServer();
  });

  beforeAll(async () => {
    await request(server).delete('/testing/all-data').expect(204);
  });

  describe('CRUD of devices', () => {
    let token_1;
    let token_2;
    let token_3;
    let token_4;
    let token_2_1;
    let devices;
    it('should create first user with correct data by sa: STATUS 201', async () => {
      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(devicesConstants.user_1)
        .expect(201);
    });
    it('should login first user and return tokens 1: STATUS 200', async () => {
      token_1 = await request(server)
        .post('/auth/login')
        .send(devicesConstants.login_1)
        .expect(200);
    });
    it('shouldn`t get all devices of first user without authorization: STATUS 401', async () => {
      await request(server).get('/security/devices').expect(401);
    });
    it('should get all devices of first user: STATUS 200', async () => {
      const res = await request(server)
        .get('/security/devices')
        .set('Cookie', token_1.headers['set-cookie'])
        .expect(200);

      expect(res.body).toHaveLength(1);
    });

    it('should create second user with correct data by sa: STATUS 201', async () => {
      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(devicesConstants.user_2)
        .expect(201);
    });

    it('should login second user and return tokens: STATUS 200', async () => {
      token_2_1 = await request(server)
        .post('/auth/login')
        .send(devicesConstants.login_2)
        .expect(200);
    });
    it('should get all devices of first user: STATUS 200', async () => {
      const res = await request(server)
        .get('/security/devices')
        .set('Cookie', token_1.headers['set-cookie'])
        .expect(200);

      expect(res.body).toHaveLength(1);
    });
    it('should login first user and return tokens 2: STATUS 200', async () => {
      token_2 = await request(server)
        .post('/auth/login')
        .send(devicesConstants.login_1)
        .expect(200);
    });
    it('should login first user and return tokens 3: STATUS 200', async () => {
      token_3 = await request(server)
        .post('/auth/login')
        .send(devicesConstants.login_1)
        .expect(200);
    });
    it('should login first user and return tokens 4: STATUS 200', async () => {
      token_4 = await request(server)
        .post('/auth/login')
        .send(devicesConstants.login_1)
        .expect(200);
    });
    it('should get all devices of first user: STATUS 200', async () => {
      devices = await request(server)
        .get('/security/devices')
        .set('Cookie', token_1.headers['set-cookie'])
        .expect(200);

      expect(devices.body).toHaveLength(4);
    });
    it('shouldn`t delete device by id without authorization: STATUS 401', async () => {
      await request(server)
        .delete(`/security/devices/${devices.body[1].deviceId}`)
        .expect(401);
    });
    it('shouldn`t delete device of other user: STATUS 403', async () => {
      await request(server)
        .delete(`/security/devices/${devices.body[1].deviceId}`)
        .set('Cookie', token_2_1.headers['set-cookie'])
        .expect(403);
    });
    it('should delete device by owner: STATUS 204', async () => {
      await request(server)
        .delete(`/security/devices/${devices.body[1].deviceId}`)
        .set('Cookie', token_1.headers['set-cookie'])
        .expect(204);
    });
    it('should get all devices of first user: STATUS 200', async () => {
      const res = await request(server)
        .get('/security/devices')
        .set('Cookie', token_1.headers['set-cookie'])
        .expect(200);

      expect(res.body).toHaveLength(3);
    });
    it('shouldn`t delete device which doesn`t exist by owner: STATUS 404', async () => {
      await request(server)
        .delete(`/security/devices/${devices.body[1].deviceId}`)
        .set('Cookie', token_1.headers['set-cookie'])
        .expect(404);
    });
    it('shouldn`t delete all active devices except this by owner without authorization: STATUS 401', async () => {
      await request(server).delete(`/security/devices`).expect(401);
    });
    it('should delete all active devices except this by owner: STATUS 204', async () => {
      await request(server)
        .delete(`/security/devices`)
        .set('Cookie', token_4.headers['set-cookie'])
        .expect(204);
    });
    it('shouldn`t get devices which was deleting by first user: STATUS 401', async () => {
      await request(server)
        .get('/security/devices')
        .set('Cookie', token_1.headers['set-cookie'])
        .expect(401);

      await request(server)
        .get('/security/devices')
        .set('Cookie', token_2.headers['set-cookie'])
        .expect(401);

      await request(server)
        .get('/security/devices')
        .set('Cookie', token_3.headers['set-cookie'])
        .expect(401);
    });

    it('should get one device of first user: STATUS 200', async () => {
      const resp = await request(server)
        .get('/security/devices')
        .set('Cookie', token_4.headers['set-cookie'])
        .expect(200);

      expect(resp.body).toHaveLength(1);
    });
  });

  afterAll(async () => {
    await request(server).delete('/testing/all-data').expect(204);
  });

  afterAll(async () => {
    await app.close();
  });
});
