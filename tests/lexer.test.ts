import { test, expect } from '@jest/globals';
import { Lexer } from '../src/lexer';
import {
  DEFINE_WITH_CONDITION,
  DEFINE_WITH_CONDITIONS_AND_OPERATIONS,
  DEFINE_WITH_CONDITION_AND_PARENTHESIS,
  DEFINE_WITH_INVALID_OPERATION_ARGUMENT,
  DEFINE_WITH_MULTIPLE_CONDITIONS,
  DEFINE_WITH_MULTIPLE_OPERATIONS,
  DEFINE_WITH_MULTIPLE_PARAMETERS,
  DEFINE_WITH_OPERATION,
  INVALID_CONDITION,
  INVALID_NUMBER_OF_ARGUMENTS,
  INVALID_OPERATION_NAME,
  INVALID_TOKEN_TYPE,
  INVALID_VARIABLE_TYPE,
  UNIQUE_DEFINE_CONSTANT,
  UNIQUE_SET_VARIABLE,
} from './inputs';

const lexer = new Lexer();

test('Get variables token', () => {
  const tokens = lexer.getTokensFromString(UNIQUE_SET_VARIABLE);

  expect(tokens[0][0]).toHaveProperty('value', 'using');
  expect(tokens[0][0]).toHaveProperty('type', 'keyword');
  expect(tokens[0][1]).toHaveProperty('value', 'username');
  expect(tokens[0][1]).toHaveProperty('type', 'variable');
  expect(tokens[0][2]).toHaveProperty('value', 'string');
  expect(tokens[0][2]).toHaveProperty('type', 'variableType');
});

test('Get define token', () => {
  const tokens = lexer.getTokensFromString(UNIQUE_DEFINE_CONSTANT);

  expect(tokens[0][0]).toHaveProperty('value', 'DEFINE');
  expect(tokens[0][0]).toHaveProperty('type', 'keyword');
  expect(tokens[0][1]).toHaveProperty('value', 'admin_role_slug');
  expect(tokens[0][1]).toHaveProperty('type', 'constant');
  expect(tokens[0][2]).toHaveProperty('value', 'admin');
  expect(tokens[0][2]).toHaveProperty('type', 'constantValue');
});

test('Get define token with operation', () => {
  const tokens = lexer.getTokensFromString(DEFINE_WITH_OPERATION);

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
  expect(() =>
    lexer.getTokensFromString(DEFINE_WITH_INVALID_OPERATION_ARGUMENT),
  ).toThrowError('Invalid argument: user_height_in_meters');
});

test('Get define token with multiple operations', () => {
  const tokens = lexer.getTokensFromString(DEFINE_WITH_MULTIPLE_OPERATIONS);

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
  const tokens = lexer.getTokensFromString(DEFINE_WITH_MULTIPLE_PARAMETERS);

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
  expect(() => lexer.getTokensFromString(INVALID_OPERATION_NAME)).toThrowError(
    'Invalid operation: invalid',
  );
});

test('Get define with condition', () => {
  const tokens = lexer.getTokensFromString(DEFINE_WITH_CONDITION);

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

test('Get invalid condition error', () => {
  expect(() => lexer.getTokensFromString(INVALID_CONDITION)).toThrowError(
    'Invalid condition: user_role then 1 else 0',
  );
});

test('Get define token with multiple conditions', () => {
  const tokens = lexer.getTokensFromString(DEFINE_WITH_MULTIPLE_CONDITIONS);

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

test('Get define token conditions and operations', () => {
  const tokens = lexer.getTokensFromString(
    DEFINE_WITH_CONDITIONS_AND_OPERATIONS,
  );

  expect(tokens[1][0]).toHaveProperty('value', 'define');
  expect(tokens[1][0]).toHaveProperty('type', 'keyword');
  expect(tokens[1][1]).toHaveProperty('value', 'is_tall');
  expect(tokens[1][1]).toHaveProperty('type', 'constant');

  expect(tokens[1][2]).toHaveProperty('type', 'condition');
  expect(tokens[1][2].conditionCheck).toHaveProperty('type', '>');

  expect(tokens[1][2].conditionCheck.left).toHaveProperty('type', 'operation');
  expect(tokens[1][2].conditionCheck.left).toHaveProperty(
    'operation',
    'multiply',
  );
  expect(tokens[1][2].conditionCheck.left.operationArgs.length).toBe(2);
  expect(tokens[1][2].conditionCheck.left.operationArgs[0]).toHaveProperty(
    'type',
    'variable',
  );
  expect(tokens[1][2].conditionCheck.left.operationArgs[0]).toHaveProperty(
    'value',
    'user_height_in_meters',
  );
  expect(tokens[1][2].conditionCheck.left.operationArgs[1]).toHaveProperty(
    'type',
    'number',
  );
  expect(tokens[1][2].conditionCheck.left.operationArgs[1]).toHaveProperty(
    'value',
    '100',
  );

  expect(tokens[1][2].conditionCheck.right).toHaveProperty('type', 'number');
  expect(tokens[1][2].conditionCheck.right).toHaveProperty('value', '180');

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

test('Get define token with conditions and parenthesis', () => {
  const tokens = lexer.getTokensFromString(
    DEFINE_WITH_CONDITION_AND_PARENTHESIS,
  );

  expect(tokens[4][0]).toHaveProperty('value', 'define');
  expect(tokens[4][0]).toHaveProperty('type', 'keyword');
  expect(tokens[4][1]).toHaveProperty('value', 'is_admin');
  expect(tokens[4][1]).toHaveProperty('type', 'constant');

  expect(tokens[4][2]).toHaveProperty('type', 'condition');
  expect(tokens[4][2].ConditionOperations.or.length).toBe(2);

  expect(
    tokens[4][2].ConditionOperations.or[0].ConditionOperations.and.length,
  ).toBe(2);

  expect(
    tokens[4][2].ConditionOperations.or[0].ConditionOperations.and[0],
  ).toHaveProperty('type', 'condition');
  expect(
    tokens[4][2].ConditionOperations.or[0].ConditionOperations.and[0]
      .conditionCheck,
  ).toHaveProperty('type', '=');

  expect(
    tokens[4][2].ConditionOperations.or[0].ConditionOperations.and[0]
      .conditionCheck.left,
  ).toHaveProperty('type', 'variable');
  expect(
    tokens[4][2].ConditionOperations.or[0].ConditionOperations.and[0]
      .conditionCheck.left,
  ).toHaveProperty('value', 'user_role');

  expect(
    tokens[4][2].ConditionOperations.or[0].ConditionOperations.and[0]
      .conditionCheck.right,
  ).toHaveProperty('type', 'constantValue');
  expect(
    tokens[4][2].ConditionOperations.or[0].ConditionOperations.and[0]
      .conditionCheck.right,
  ).toHaveProperty('value', 'admin');

  expect(
    tokens[4][2].ConditionOperations.or[0].ConditionOperations.and[1],
  ).toHaveProperty('type', 'condition');
  expect(
    tokens[4][2].ConditionOperations.or[0].ConditionOperations.and[1]
      .conditionCheck,
  ).toHaveProperty('type', '=');

  expect(
    tokens[4][2].ConditionOperations.or[0].ConditionOperations.and[1]
      .conditionCheck.left,
  ).toHaveProperty('type', 'variable');
  expect(
    tokens[4][2].ConditionOperations.or[0].ConditionOperations.and[1]
      .conditionCheck.left,
  ).toHaveProperty('value', 'user_password');

  expect(
    tokens[4][2].ConditionOperations.or[0].ConditionOperations.and[1]
      .conditionCheck.right,
  ).toHaveProperty('type', 'constant');
  expect(
    tokens[4][2].ConditionOperations.or[0].ConditionOperations.and[1]
      .conditionCheck.right,
  ).toHaveProperty('value', 'default_password');

  expect(
    tokens[4][2].ConditionOperations.or[1].ConditionOperations.and.length,
  ).toBe(2);

  expect(
    tokens[4][2].ConditionOperations.or[1].ConditionOperations.and[0],
  ).toHaveProperty('type', 'condition');
  expect(
    tokens[4][2].ConditionOperations.or[1].ConditionOperations.and[0]
      .conditionCheck,
  ).toHaveProperty('type', '=');

  expect(
    tokens[4][2].ConditionOperations.or[1].ConditionOperations.and[0]
      .conditionCheck.left,
  ).toHaveProperty('type', 'variable');
  expect(
    tokens[4][2].ConditionOperations.or[1].ConditionOperations.and[0]
      .conditionCheck.left,
  ).toHaveProperty('value', 'user_name');

  expect(
    tokens[4][2].ConditionOperations.or[1].ConditionOperations.and[0]
      .conditionCheck.right,
  ).toHaveProperty('type', 'constantValue');
  expect(
    tokens[4][2].ConditionOperations.or[1].ConditionOperations.and[0]
      .conditionCheck.right,
  ).toHaveProperty('value', 'admin');

  expect(tokens[4][2].ConditionOperations.resultIfTrue).toHaveProperty(
    'type',
    'constantValue',
  );

  expect(tokens[4][2].ConditionOperations.resultIfTrue).toHaveProperty(
    'value',
    '1',
  );

  expect(tokens[4][2].ConditionOperations.resultIfFalse).toHaveProperty(
    'type',
    'constantValue',
  );

  expect(tokens[4][2].ConditionOperations.resultIfFalse).toHaveProperty(
    'value',
    '0',
  );
});

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
  expect(() => lexer.getTokensFromString(INVALID_TOKEN_TYPE)).toThrow(
    'Unknown token type: invalid',
  );
});

test('Get invalid type for using command', () => {
  expect(() => lexer.getTokensFromString(INVALID_VARIABLE_TYPE)).toThrow(
    'Invalid type for using command: integer',
  );
});

test('Get invalid number of arguments for command', () => {
  expect(() => lexer.getTokensFromString(INVALID_NUMBER_OF_ARGUMENTS)).toThrow(
    'Invalid number of arguments for command: using age',
  );
});
