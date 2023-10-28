import { Token, TokenConditionCheckType, TokenValueType } from './types';

export class Lexer {
  constants: Array<Token> = [];
  variables: Array<Token> = [];

  getTokensFromString(input: string): Array<Array<Token>> {
    this.constants = [];
    this.variables = [];
    const commands = this.getCommands(input);

    return commands.map(command => {
      const args = command.split(' ').filter(arg => arg.length > 0);
      return this.getTokensByType(args);
    });
  }

  private getTokensByType(args: Array<string>): Array<Token> {
    const [type] = args;

    switch (type.toLocaleLowerCase()) {
      case 'using':
        this.validateCommandArgsLength(args, 3);
        return this.getUsingToken(args);
      case 'define':
        this.validateCommandArgsLength(args, 3);
        return this.getDefineToken(args);
      default:
        throw new Error(`Unknown token type: ${type}`);
    }
  }

  private getDefineToken(args: Array<string>): Array<Token> {
    const [keyword, variableName, ...variableValue] = args;
    const commandTokens: Array<Token> = [
      { type: 'keyword', value: keyword },
      { type: 'constant', value: variableName },
    ];

    if (variableValue.length === 1) {
      commandTokens.push({ type: 'constantValue', value: variableValue[0] });
    } else if (this.isConditional(variableValue[0])) {
      commandTokens.push(this.getConditionalToken(variableValue));
    } else {
      const value = variableValue.join(' ');
      commandTokens.push(this.getOperationToken(value));
    }

    this.constants.push({ type: 'constant', value: variableName });

    return commandTokens;
  }

  private getUsingToken(args: Array<string>): Array<Token> {
    const [keyword, variableName, type] = args;

    if (type !== 'string' && type !== 'number') {
      throw new Error(`Invalid type for using command: ${type}`);
    }

    this.variables.push({ type: 'variable', value: variableName });

    return [
      { type: 'keyword', value: keyword },
      { type: 'variable', value: variableName },
      { type: 'variableType', value: type as TokenValueType },
    ];
  }

  private getCommands(input: string): Array<string> {
    return input
      .trim()
      .split(';')
      .map(command => command.trim())
      .filter(command => command.length > 0);
  }

  private getOperationToken(args: string): Token {
    this.validateOperation(args);
    const [operation, ...operationArgs] = args.split('(');

    const operationToken: Token = {
      type: 'operation',
      operation: operation as Token['operation'],
      operationArgs: [],
    };

    let operationArgsString = operationArgs.join('(').slice(0, -1);

    while (operationArgsString.length > 0) {
      let [arg, ...rest] = operationArgsString
        .split(',')
        .filter(arg => arg.length > 0)
        .map(arg => arg.trim());

      if (arg.includes('(')) {
        rest.unshift(arg);
        const closingParenthesisIndex = rest.join(',').indexOf(')');

        operationToken.operationArgs.push(
          this.getOperationToken(
            rest.join(',').slice(0, closingParenthesisIndex + 1),
          ),
        );

        rest = rest
          .join(',')
          .slice(closingParenthesisIndex + 1)
          .split(',');
      } else if (this.isVariable(arg)) {
        operationToken.operationArgs.push({
          type: 'variable',
          value: arg,
        });
      } else if (this.isConstant(arg)) {
        operationToken.operationArgs.push({
          type: 'constant',
          value: arg,
        });
      } else if (!isNaN(Number(arg))) {
        operationToken.operationArgs.push({
          type: 'number',
          value: arg,
        });
      } else {
        throw new Error(`Invalid argument: ${arg}`);
      }

      operationArgsString = rest.join(',');
    }

    return operationToken;
  }

  private isVariable(value: string): boolean {
    return this.variables.some(variable => variable.value === value);
  }

  private isConstant(value: string): boolean {
    return this.constants.some(constant => constant.value === value);
  }

  private isOperation(value: string): boolean {
    return ['add', 'subtract', 'multiply', 'divide'].includes(
      value.toLocaleLowerCase(),
    );
  }

  private getValueToken(value: string): Token {
    value = value.trim();
    if (this.isVariable(value)) {
      return { type: 'variable', value };
    }

    if (this.isConstant(value)) {
      return { type: 'constant', value };
    }

    if (this.isOperation(value.split('(')[0])) {
      return this.getOperationToken(value);
    }

    if (!isNaN(Number(value))) {
      return { type: 'number', value };
    }

    return { type: 'constantValue', value };
  }

  private validateOperation(operation: string) {
    const operationName = operation.split('(')[0];

    if (!this.isOperation(operationName)) {
      throw new Error(`Invalid operation: ${operationName}`);
    }
  }

  private isConditional(value: string): boolean {
    return value === 'if';
  }

  private getUniqueConditionalToken(args: Array<string>): Token {
    const checkOperatorIndex = args.findIndex(arg =>
      this.validateConditionCheckType(arg),
    );
    const thenIndex = args.findIndex(arg => arg === 'then');
    const elseIndex = args.findIndex(arg => arg === 'else');

    if (checkOperatorIndex === -1) {
      throw new Error(`Invalid condition: ${args.join(' ')}`);
    }

    return {
      type: 'condition',
      conditionCheck: {
        left: this.getValueToken(args.slice(0, checkOperatorIndex).join(' ')),
        right: this.getValueToken(
          args
            .slice(
              checkOperatorIndex + 1,
              thenIndex >= 0 ? thenIndex : undefined,
            )
            .join(' '),
        ),
        type: args[checkOperatorIndex] as TokenConditionCheckType,
        resultIfFalse:
          elseIndex > -1
            ? this.getValueToken(args.slice(elseIndex + 1).join(' '))
            : { type: 'null' },
        resultIfTrue:
          thenIndex > -1
            ? this.getValueToken(args.slice(thenIndex + 1, elseIndex).join(' '))
            : { type: 'null' },
      },
    };
  }

  private getOneOperatorConditionToken(
    args: Array<string>,
    operator: 'and' | 'or',
  ): Token {
    const thenIndex = args.findIndex(arg => arg === 'then');
    const elseIndex = args.findIndex(arg => arg === 'else');

    const conditions = args
      .slice(0, thenIndex > -1 ? thenIndex : elseIndex)
      .join(' ')
      .split(operator);

    return {
      type: 'condition',
      ConditionOperations: {
        [operator]: conditions.map(condition =>
          this.getUniqueConditionalToken(condition.split(' ')),
        ),
        resultIfFalse:
          elseIndex > -1
            ? this.getValueToken(args.slice(elseIndex + 1).join(' '))
            : { type: 'null' },
        resultIfTrue:
          thenIndex > -1
            ? this.getValueToken(args.slice(thenIndex + 1, elseIndex).join(' '))
            : { type: 'null' },
      },
    };
  }

  private getConditionalToken(args: Array<string>): Token {
    args.shift();
    if (!args[1].includes('(')) {
      if (args.includes('and') && !args.includes('or')) {
        return this.getOneOperatorConditionToken(args, 'and');
      } else if (args.includes('or') && !args.includes('and')) {
        return this.getOneOperatorConditionToken(args, 'or');
      } else if (args.includes('and') && args.includes('or')) {
      } else {
        return this.getUniqueConditionalToken(args);
      }
    } else {}
  }

  private validateConditionCheckType(operator): boolean {
    return ['=', '!=', '<', '>', '<=', '>=', 'regex'].includes(operator);
  }

  private validateCommandArgsLength(args: Array<string>, length: number): void {
    if (args.length < length) {
      throw new Error(
        `Invalid number of arguments for command: ${args.join(' ')}`,
      );
    }
  }
}
