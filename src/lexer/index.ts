import { Token, TokenValueType } from './types';

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
    } else {
      const value = variableValue.join(' ');
      commandTokens.push(this.getOperationArgs(value));
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

  private getOperationArgs(args: string): Token {
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
          this.getOperationArgs(
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

  private validateOperation(operation: string) {
    const operationName = operation.split('(')[0];

    if (
      !['add', 'subtract', 'multiply', 'divide'].includes(
        operationName.toLocaleLowerCase(),
      )
    ) {
      throw new Error(`Invalid operation: ${operationName}`);
    }
  }

  private validateCommandArgsLength(args: Array<string>, length: number): void {
    if (args.length < length) {
      throw new Error(
        `Invalid number of arguments for command: ${args.join(' ')}`,
      );
    }
  }
}
