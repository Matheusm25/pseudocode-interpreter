import { Token, TokenValueType } from './types';

export class Lexer {
  getTokensFromString(input: string): Array<Token> {
    const commands = this.getCommands(input);

    return commands.map(command => {
      const args = command.split(' ');
      return this.getTokenByType(args);
    });
  }

  private getTokenByType(args: Array<string>): Token {
    const [type, ...values] = args;

    switch (type.toLocaleLowerCase()) {
      case 'using':
        this.validateCommandArgsLength(args, 4);
        return this.getUsingToken(
          values[0],
          values[2].toLocaleLowerCase() as TokenValueType,
        );
      case 'define':
        this.validateCommandArgsLength(args, 4);
        return this.getDefineToken(values[0], values[2]);
      default:
        throw new Error(`Unknown token type: ${type}`);
    }
  }

  private getDefineToken(variableName: string, variableValue: string): Token {
    return {
      type: 'define',
      constValue: variableValue,
      value: variableName,
      valueType: 'string',
    };
  }

  private getUsingToken(variableName: string, type: TokenValueType): Token {
    if (type !== 'string' && type !== 'number') {
      throw new Error(`Invalid type for using command: ${type}`);
    }

    return {
      type: 'using',
      value: variableName,
      valueType: type,
    };
  }

  private getCommands(input: string): Array<string> {
    return input
      .trim()
      .split(';')
      .map(command => command.trim())
      .filter(command => command.length > 0);
  }

  private validateCommandArgsLength(args: Array<string>, length: number): void {
    if (args.length < length) {
      throw new Error(
        `Invalid number of arguments for command: ${args.join(' ')}`,
      );
    }
  }
}
