import { test, expect } from '@jest/globals';
import { Lexer } from '../src/lexer';

const lexer = new Lexer();

test('Get variables token', () => {
  const input = `
    using username as string;
    using user_role as String;
  `;

  const tokens = lexer.getTokensFromString(input);

  expect(tokens).toHaveLength(2);
  expect(tokens[0]).toHaveProperty('type', 'using');
  expect(tokens[0]).toHaveProperty('value', 'username');
});

test('Get define token', () => {
  const input = `
    define admin_role_slug as admin;
  `;

  const tokens = lexer.getTokensFromString(input);

  expect(tokens).toHaveLength(1);
  expect(tokens[0]).toHaveProperty('type', 'define');
  expect(tokens[0]).toHaveProperty('value', 'admin_role_slug');
  expect(tokens[0]).toHaveProperty('constValue', 'admin');
});

test('Get invalid type for using command', () => {
  const input = `
    using age as integer;
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
