export interface Token {
  type: TokenType;
  value?: string;
  operation?: TokenOperation;
  operationArgs?: Array<Token>;
}

type TokenType =
  | 'keyword'
  | 'variable'
  | 'variableType'
  | 'constant'
  | 'constantValue'
  | 'operation'
  | 'number';
export type TokenValueType = 'string' | 'number';
export type TokenOperation = 'multiply' | 'divide' | 'add' | 'subtract';
