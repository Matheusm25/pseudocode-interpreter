import { test, expect } from '@jest/globals';
import { Lexer } from '../src/lexer';

const lexer = new Lexer();

test('Get variables token', () => {
  const input = 'using username string;';

  const tokens = lexer.getTokensFromString(input);

  expect(tokens[0][0]).toHaveProperty('value', 'using');
  expect(tokens[0][0]).toHaveProperty('type', 'keyword');
  expect(tokens[0][1]).toHaveProperty('value', 'username');
  expect(tokens[0][1]).toHaveProperty('type', 'variable');
  expect(tokens[0][2]).toHaveProperty('value', 'string');
  expect(tokens[0][2]).toHaveProperty('type', 'variableType');
});

test('Get define token', () => {
  const input = 'DEFINE admin_role_slug admin;';

  const tokens = lexer.getTokensFromString(input);

  expect(tokens[0][0]).toHaveProperty('value', 'DEFINE');
  expect(tokens[0][0]).toHaveProperty('type', 'keyword');
  expect(tokens[0][1]).toHaveProperty('value', 'admin_role_slug');
  expect(tokens[0][1]).toHaveProperty('type', 'constant');
  expect(tokens[0][2]).toHaveProperty('value', 'admin');
  expect(tokens[0][2]).toHaveProperty('type', 'constantValue');
});

test('Get define token with operation', () => {
  const input = `
    using user_height_in_meters number;
    define user_height_in_centimeters multiply(user_height_in_meters, 100);
  `;

  const tokens = lexer.getTokensFromString(input);

  expect(tokens).toHaveLength(2);
  expect(tokens[1][0]).toHaveProperty('value', 'define');
  expect(tokens[1][0]).toHaveProperty('type', 'keyword');
  expect(tokens[1][1]).toHaveProperty('value', 'user_height_in_centimeters');
  expect(tokens[1][1]).toHaveProperty('type', 'constant');

  expect(tokens[1][2]).toHaveProperty('operation', 'multiply');
  expect(tokens[1][2]).toHaveProperty('type', 'operation');
  expect(tokens[1][2].operationArgs.length).toBe(2);
  expect(tokens[1][2].operationArgs[0]).toHaveProperty(
    'value',
    'user_height_in_meters',
  );
  expect(tokens[1][2].operationArgs[0]).toHaveProperty('type', 'variable');
  expect(tokens[1][2].operationArgs[1]).toHaveProperty('value', '100');
  expect(tokens[1][2].operationArgs[1]).toHaveProperty('type', 'number');
});

test('Get define token with invalid operation argument', () => {
  const input = `
    define user_height_in_centimeters multiply(user_height_in_meters, 100);
  `;

  expect(() => lexer.getTokensFromString(input)).toThrowError(
    'Invalid argument: user_height_in_meters',
  );
});

test('Get define token with multiple operations', () => {
  const input = `
    using user_age number;
    define user_age_in_days multiply(user_age, multiply(30, 12));
  `;

  const tokens = lexer.getTokensFromString(input);

  expect(tokens).toHaveLength(2);
  expect(tokens[1][0]).toHaveProperty('value', 'define');
  expect(tokens[1][0]).toHaveProperty('type', 'keyword');
  expect(tokens[1][1]).toHaveProperty('value', 'user_age_in_days');
  expect(tokens[1][1]).toHaveProperty('type', 'constant');

  expect(tokens[1][2]).toHaveProperty('operation', 'multiply');
  expect(tokens[1][2]).toHaveProperty('type', 'operation');
  expect(tokens[1][2].operationArgs.length).toBe(2);
  expect(tokens[1][2].operationArgs[0]).toHaveProperty('value', 'user_age');
  expect(tokens[1][2].operationArgs[0]).toHaveProperty('type', 'variable');

  expect(tokens[1][2].operationArgs[1]).toHaveProperty('operation', 'multiply');
  expect(tokens[1][2].operationArgs[1]).toHaveProperty('type', 'operation');
  expect(tokens[1][2].operationArgs[1].operationArgs.length).toBe(2);
});

test('Get define token with multiple parameters in operation', () => {
  const input = 'define number_for_test add(1, add(2, 3), subtract(5, 2));';

  const tokens = lexer.getTokensFromString(input);

  expect(tokens).toHaveLength(1);
  expect(tokens[0][0]).toHaveProperty('value', 'define');
  expect(tokens[0][0]).toHaveProperty('type', 'keyword');
  expect(tokens[0][1]).toHaveProperty('value', 'number_for_test');
  expect(tokens[0][1]).toHaveProperty('type', 'constant');

  expect(tokens[0][2]).toHaveProperty('operation', 'add');
  expect(tokens[0][2]).toHaveProperty('type', 'operation');
  expect(tokens[0][2].operationArgs.length).toBe(3);
});

test('Get invalid operation name', () => {
  const input = 'define number_for_test invalid(1, 2);';

  expect(() => lexer.getTokensFromString(input)).toThrowError(
    'Invalid operation: invalid',
  );
});

test('Get define with condition', () => {
  const input = `
    using user_role string;
    define is_admin if user_role = admin then 1 else 0;
  `;

  const tokens = lexer.getTokensFromString(input);

  expect(tokens).toHaveLength(2);
  expect(tokens[1][0]).toHaveProperty('value', 'define');
  expect(tokens[1][0]).toHaveProperty('type', 'keyword');
  expect(tokens[1][1]).toHaveProperty('value', 'is_admin');
  expect(tokens[1][1]).toHaveProperty('type', 'constant');

  expect(tokens[1][2]).toHaveProperty('type', 'condition');
  expect(tokens[1][2].conditionCheck).toHaveProperty('type', '=');

  expect(tokens[1][2].conditionCheck.left).toHaveProperty('type', 'variable');
  expect(tokens[1][2].conditionCheck.left).toHaveProperty('value', 'user_role');

  expect(tokens[1][2].conditionCheck.right).toHaveProperty(
    'type',
    'constantValue',
  );
  expect(tokens[1][2].conditionCheck.right).toHaveProperty('value', 'admin');

  expect(tokens[1][2].conditionCheck.resultIfTrue).toHaveProperty(
    'type',
    'number',
  );
  expect(tokens[1][2].conditionCheck.resultIfTrue).toHaveProperty('value', '1');

  expect(tokens[1][2].conditionCheck.resultIfFalse).toHaveProperty(
    'type',
    'number',
  );
  expect(tokens[1][2].conditionCheck.resultIfFalse).toHaveProperty(
    'value',
    '0',
  );
});

// test('Get invalid condition error', () => {
//   const input = `
//     using user_role string;
//     define is_admin if user_role then 1 else 0;
//   `;

//   expect(() => lexer.getTokensFromString(input)).toThrowError(
//     'Invalid condition: if user_role then 1 else 0',
//   );
// });

test('Get define token with multiple conditions', () => {
  const input = `
    using user_role string;
    using user_password string;

    define default_password admin123;

    define is_admin if user_role = admin and user_password = default_password then 1 else 0;
  `;

  const tokens = lexer.getTokensFromString(input);

  expect(tokens[3][0]).toHaveProperty('value', 'define');
  expect(tokens[3][0]).toHaveProperty('type', 'keyword');
  expect(tokens[3][1]).toHaveProperty('value', 'is_admin');
  expect(tokens[3][1]).toHaveProperty('type', 'constant');

  expect(tokens[3][2]).toHaveProperty('type', 'condition');
  expect(tokens[3][2].ConditionOperations.and.length).toBe(2);

  expect(tokens[3][2].ConditionOperations.and[0]).toHaveProperty(
    'type',
    'condition',
  );
  expect(tokens[3][2].ConditionOperations.and[0].conditionCheck).toHaveProperty(
    'type',
    '=',
  );

  expect(
    tokens[3][2].ConditionOperations.and[0].conditionCheck.left,
  ).toHaveProperty('type', 'variable');
  expect(
    tokens[3][2].ConditionOperations.and[0].conditionCheck.left,
  ).toHaveProperty('value', 'user_role');

  expect(
    tokens[3][2].ConditionOperations.and[0].conditionCheck.right,
  ).toHaveProperty('type', 'constantValue');
  expect(
    tokens[3][2].ConditionOperations.and[0].conditionCheck.right,
  ).toHaveProperty('value', 'admin');

  expect(tokens[3][2].ConditionOperations.and[1]).toHaveProperty(
    'type',
    'condition',
  );
  expect(tokens[3][2].ConditionOperations.and[1].conditionCheck).toHaveProperty(
    'type',
    '=',
  );

  expect(
    tokens[3][2].ConditionOperations.and[1].conditionCheck.left,
  ).toHaveProperty('type', 'variable');
  expect(
    tokens[3][2].ConditionOperations.and[1].conditionCheck.left,
  ).toHaveProperty('value', 'user_password');

  expect(
    tokens[3][2].ConditionOperations.and[1].conditionCheck.right,
  ).toHaveProperty('type', 'constant');
  expect(
    tokens[3][2].ConditionOperations.and[1].conditionCheck.right,
  ).toHaveProperty('value', 'default_password');

  expect(tokens[3][2].ConditionOperations.resultIfTrue).toHaveProperty(
    'type',
    'number',
  );
  expect(tokens[3][2].ConditionOperations.resultIfTrue).toHaveProperty(
    'value',
    '1',
  );

  expect(tokens[3][2].ConditionOperations.resultIfFalse).toHaveProperty(
    'type',
    'number',
  );
  expect(tokens[3][2].ConditionOperations.resultIfFalse).toHaveProperty(
    'value',
    '0',
  );
});

// test('Get define token conditions and operations', () => {
//   const input = `
//     using user_height_in_meters number;

//     define is_tall if multiply(user_height_in_meters, 100) > 180 then 1 else 0;
//   `;
// });

// test('Test > operation', () => {
//   const input = `
//     using user_height_in_meters number;

//     define is_tall if user_height_in_meters > 180 then 1 else 0;
//   `;
// });

// test('Test >= operation', () => {
//   const input = `
//     using user_height_in_meters number;

//     define is_tall if user_height_in_meters >= 180 then 1 else 0;
//   `;
// });

// test('Test < operation', () => {
//   const input = `
//     using user_height_in_meters number;

//     define is_short if user_height_in_meters < 180 then 1 else 0;
//   `;
// });

// test('Test <= operation', () => {
//   const input = `
//     using user_height_in_meters number;

//     define is_short if user_height_in_meters <= 180 then 1 else 0;
//   `;
// });

// test('Test != operation', () => {
//   const input = `
//     using user_role string;
//     define commom_user if user_role != admin then 1 else 0;
//   `;
// });

// test('Test regex operation', () => {
//   const input = `
//     using user_name string;
//     define is_admin if user_name regex %admin% then 1 else 0;
//   `;
// });

// test('Get define token with conditions and parenthesis', () => {
//   const input = `
//     using user_name string;
//     using user_role string;
//     using user_password string;

//     define default_password admin123;

//     define is_admin if (user_role = admin and user_password = default_password) or user_name = admin then 1 else 0;
//   `;
// });

// test('Get return token of a variable', () => {
//   const input = `
//     using user_role string;
//     return user_role;
//   `;
// });

// test('Get return token of a const', () => {
//   const input = `
//     using user_role as string;
//     define admin_role_slug as admin;
//     return admin_role_slug;
//   `;

//   const tokens = lexer.getTokensFromString(input);

//   expect(tokens).toHaveLength(3);
//   expect(tokens[2]).toHaveProperty('type', 'return');
//   expect(tokens[2]).toHaveProperty('value', 'admin_role_slug');
// });

// test('Get return token of a condition', () => {
//   const input = `
//     using user_role as string;
//     define admin_role_slug as admin;
//     return user_role = admin_role_slug;
//   `;

//   const tokens = lexer.getTokensFromString(input);

//   expect(tokens).toHaveLength(3);
//   expect(tokens[2]).toHaveProperty('type', 'return');
//   expect(tokens[2]).toHaveProperty('value', '');
// });

test('Get invalid token type', () => {
  const input = `
      invalid username string;
    `;

  expect(() => lexer.getTokensFromString(input)).toThrow(
    'Unknown token type: invalid',
  );
});

test('Get invalid type for using command', () => {
  const input = `
    using age integer;
  `;

  expect(() => lexer.getTokensFromString(input)).toThrow(
    'Invalid type for using command: integer',
  );
});

test('Get invalid number of arguments for command', () => {
  const input = `
    using age;
  `;

  expect(() => lexer.getTokensFromString(input)).toThrow(
    'Invalid number of arguments for command: using age',
  );
});
