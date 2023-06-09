export interface Token {
  type: 'using' | 'define';
  constValue?: string;
  valueType?: TokenValueType;
  value: string;
}
export type TokenValueType = 'string' | 'number';
