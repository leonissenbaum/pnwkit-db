import superagent from 'superagent';
import { AnyQuery } from '../interfaces/PoliticsAndWarGraphQL';
import { ResponseAndMetadataI } from '../interfaces/GraphQLService';

/**
 * An internal method of handling calls to the P&W graphQL API
 */
class GraphQLService {
  private politicsAndWarAPIRoot = 'https://api.politicsandwar.com/graphql';

  /**
   * Calls the Politics and War V3 API with a query
   * @param {string} query The GraphQL query to make
   * @param {string} apiKey Your P&W API key
   *
   * @return {Promise<any>} Returns data to be type determined in a closer function
   * @throws {Error}
   */
  public async makeCall(query: string, apiKey: string): Promise<ResponseAndMetadataI> {
    if (!apiKey) throw new Error('GraphQLService: Cannot make a call without an API key!');

    const res = await superagent.get(this.politicsAndWarAPIRoot)
      .query({
        api_key: apiKey,
        query,
      })
      .accept('json')
      .then()
      .catch((e: Error) => {
        throw new Error(`GraphQLService: Failed to make api call, ${e}`);
      });

    if (!res.body.data) throw new Error(`GraphQLService: Received no data from API call, ${JSON.stringify(res.body)}`);

    return {
      data: res.body.data,
      rateLimit: {
        resetAfterSeconds: Number(res.get('X-RateLimit-Reset-After')),
        limit: Number(res.get('X-RateLimit-Limit')),
        remaining: Number(res.get('X-RateLimit-Remaining')),
        reset: Number(res.get('X-RateLimit-Reset')),
      },
    };
  }

  public async makeMutationCall(query: string, apiKey: string, bot_key: string, bot_key_api_key: string): Promise<ResponseAndMetadataI> {
    if (!apiKey) throw new Error('GraphQLService: Cannot make a call without an API key!');
    if (!bot_key) throw new Error('GraphQLService: Cannot make a call without an bot key!');
    if (!bot_key_api_key) throw new Error('GraphQLService: Cannot make a call without a bot_key_api_key!');

    const res = await superagent.get(this.politicsAndWarAPIRoot)
      .query({
        api_key: apiKey,
        bot_key: bot_key,
        bot_key_api_key: bot_key_api_key,
        query,
      })
      .accept('json')
      .then()
      .catch((e: Error) => {
        throw new Error(`GraphQLService: Failed to make api call, ${e}`);
      });

    if (!res.body.data) throw new Error(`GraphQLService: Received no data from API call, ${JSON.stringify(res.body)}`);

    return {
      data: res.body.data,
      rateLimit: {
        resetAfterSeconds: Number(res.get('X-RateLimit-Reset-After')),
        limit: Number(res.get('X-RateLimit-Limit')),
        remaining: Number(res.get('X-RateLimit-Remaining')),
        reset: Number(res.get('X-RateLimit-Reset')),
      },
    };
  }

  /**
   * Takes a query and outputs query Parameters
   * @param {AnyQuery} queryParameters Any one of the five queries that take Parameters
   * @param {string} enumeratorParameters Parameters who are represented as strings, but not sent as a string;
   * they are treated like numbers, with no quotes.
   * @return {string}
   */
  public generateParameters(queryParameters: AnyQuery, enumeratorParameters: string[] = []): string {
    const parameters: string[] = [];

    for (const [parameter, value] of Object.entries(queryParameters)) {
      if (value === undefined) continue;

      if (typeof value == 'string' && !enumeratorParameters.includes(parameter)) {
        parameters.push(`${parameter}: "${value}"`);
      } else if (typeof value == 'object' && Array.isArray(value)) {
        let interpretedValue = `${parameter}: [`;

        for (const v of value) {
          if (typeof v == 'string') {
            interpretedValue += `"${v}",`;
          } else {
            interpretedValue += `${v},`;
          }
        }

        interpretedValue.slice(0, -1);
        interpretedValue += ']';

        parameters.push(interpretedValue);
      } else if (typeof value == 'object' && !Array.isArray(value)) {
        // for orderBy handling

        let interpretedValue = '';
        interpretedValue += `${parameter}: {`;

        for (const [k, v] of Object.entries(value)) {
          interpretedValue += `${k}: ${v},`;
        }

        interpretedValue = interpretedValue.slice(0, -1);
        interpretedValue += '}';
        
        parameters.push(interpretedValue);
      } else {
        parameters.push(`${parameter}: ${value}`);
      }
    }

    if (parameters.length == 0) return '';

    const joinedParameters = parameters.join(',');
    return `(${joinedParameters})`;
  }
}

export default new GraphQLService();
