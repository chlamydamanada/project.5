import request from 'supertest';

export const publishOrUnpublishQuestion = async (
  server: any,
  questionId: string,
  publishOrUnpublishDto: { published: boolean },
) => {
  return request(server)
    .put(`/sa/quiz/questions/${questionId}/publish`)
    .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
    .send(publishOrUnpublishDto)
    .expect(204);
};
