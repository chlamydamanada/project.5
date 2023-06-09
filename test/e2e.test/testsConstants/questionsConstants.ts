export const QuestionsConstants = {
  create_question: {
    body: 'What`s two + two = ?',
    correctAnswers: ['4', 'four', '2*2'],
  },
  update_question: {
    body: 'What`s 2 + 2 = ?',
    correctAnswers: ['4', 'four'],
  },
  publish: {
    published: true,
  },
  unpublish: {
    published: false,
  },
  invalid_question_body_1: {
    body: 2 + 2,
    correctAnswers: ['4', 'four', '2*2'],
  },
  invalid_question_body_2: {
    body: '2+2',
    correctAnswers: ['4', 'four', '2*2'],
  },
  invalid_question_body_3: {
    body: 'dfmgitgjrkefoplkjithigefkgtrjfkolpgkhtjrokgtjnhygibok0gktmrjgiotrkjgihotrnjgihotjrngijerntgiutfjhnrijtrhngihtjrhngitfurjhbgnhgtrghjmkuyjutykiyuuytuyjtkuyjryetwyrjtk,hjukyturyet6wryk,jhkuyjuy7utkyuiu57u6ikuylio;p[p;oilkujyhtgrtyuiopjuyhgtfdtyuioujyhtretyuiouytrtyuiopuytretyuiouytrngiutjhrnigtjrgihtojrgioftjrnhigotfjrngihotrjntgjihotrekjntgkiofterjntkgiotrkjnhgiotrjngkhiotkjrngkhiotkrjngjihotfrkjngihotfrkjngkhtrjngjkihotkrjntgkhtirjngjkiotrkjnghitfrkjngjiotrkjngjihoftkjnkioftrkjgkifjrntgitjrnhfirekjnghjigft',
    correctAnswers: ['4', 'four', '2*2'],
  },
  invalid_question_answers_1: {
    body: 'What`s two + two = ?',
    correctAnswers: null,
  },
  invalid_question_answers_2: {
    body: 'What`s two + two = ?',
    correctAnswers: '2*2',
  },
  invalid_question_answers_3: {
    body: 'What`s two + two = ?',
    correctAnswers: true,
  },
  invalid_question_answers_4: {
    body: 'What`s two + two = ?',
    correctAnswers: [],
  },
  invalid_question_answers_5: {
    body: 'What`s two + two = ?',
    correctAnswers: [true],
  },
  invalid_question: {
    body: '2+2',
    correctAnswers: true,
  },
  invalid_publish_1: {
    published: 'true',
  },
  invalid_publish_2: {
    published: 1234568,
  },
  invalid_id: '111a11b1-11c1-1111-1111-d1e1ab11c111',
  valid_question_1: {
    body: 'What`s 1 + 1 = ?',
    correctAnswers: ['2', 'two'],
  },
  valid_question_2: {
    body: 'What`s 12 + 2 = ?',
    correctAnswers: ['14', 'fourteen'],
  },
  valid_question_3: {
    body: 'What`s 3 + 3 = ?',
    correctAnswers: ['6', 'six'],
  },
  valid_question_4: {
    body: 'What`s 4 + 4 = ?',
    correctAnswers: ['8', 'eight'],
  },
  valid_question_5: {
    body: 'What`s 5 + 5 = ?',
    correctAnswers: ['10', 'ten'],
  },
  valid_question_6: {
    body: 'What`s 6 + 6 = ?',
    correctAnswers: ['12', 'twelve'],
  },
  valid_question_7: {
    body: 'What`s 7 + 7 = ?',
    correctAnswers: ['14', 'fourteen'],
  },
  valid_question_8: {
    body: 'What`s 8 + 8 = ?',
    correctAnswers: ['16', 'sixteen'],
  },
  valid_question_9: {
    body: 'What`s 9 + 9 = ?',
    correctAnswers: ['18', 'eighteen'],
  },
  valid_question_10: {
    body: 'What`s 10 + 10 = ?',
    correctAnswers: ['20', 'twenty'],
  },
};
