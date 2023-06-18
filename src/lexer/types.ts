export interface Token {
  type: TokenType;
  value?: string;
  operation?: TokenOperation;
  operationArgs?: Array<Token>;
  conditionCheck?: ConditionCheck;
  ConditionOperations?: ConditionOperations;
}

interface ConditionOperations {
  or?: Array<Token>;
  and?: Array<Token>;
  resultIfTrue: Token;
  resultIfFalse: Token;
}

interface ConditionCheck {
  type: TokenConditionCheckType;
  left: Token;
  right: Token;
  resultIfTrue: Token;
  resultIfFalse: Token;
}

type TokenType =
  | 'keyword'
  | 'variable'
  | 'variableType'
  | 'constant'
  | 'constantValue'
  | 'operation'
  | 'number'
  | 'condition'
  | 'null';
export type TokenValueType = 'string' | 'number';
export type TokenOperation = 'multiply' | 'divide' | 'add' | 'subtract';
export type TokenConditionCheckType =
  | '='
  | '>'
  | '>='
  | '<'
  | '<='
  | '!='
  | 'regex';
