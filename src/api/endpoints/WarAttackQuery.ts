import { Kit } from '../..';
import {
  QueryWarattacksArgs,
  QueryWarattacksOrderByOrderByClause, WarAttack, WarAttackPaginator,
} from '../../interfaces/PoliticsAndWarGraphQL';
import GraphQL from '../../services/GraphQL';

export interface Parameters {
  id?: number[];
  min_id?: number;
  max_id?: number;
  war_id?: number[];
  before?: Date;
  after?: Date;
  orderBy?: QueryWarattacksOrderByOrderByClause;
  first?: number;
  page?: number;
}

/**
 * Gets a list of war attacks
 * @param {Parameters} params Query parameters to customize your results
 * @param {string} query The graphql query to get info with
 * @param {boolean} paginator If true it will return paginator info
 * @return {Promise<WarAttack[] | WarAttackPaginator>}
 */
export default async function warAttackQuery(this: Kit, params: Parameters, query: string, paginator?: false): Promise<WarAttack[]>;
export default async function warAttackQuery(this: Kit, params: Parameters, query: string, paginator: true): Promise<WarAttackPaginator>;
export default async function warAttackQuery(
  this: Kit,
  params: Parameters,
  query: string,
  paginator?: boolean,
): Promise<WarAttack[] | WarAttackPaginator> {
  const argsToParameters = GraphQL.generateParameters(params as QueryWarattacksArgs);

  const res = await GraphQL.makeCall(`
    {
      warattacks${argsToParameters} {
        ${(paginator) ?
    `
          paginatorInfo {
            count,
            currentPage,
            firstItem,
            hasMorePages,
            lastItem,
            lastPage,
            perPage,
            total
          },
          `: ''
  }
        data {
          ${query}
        }
      }
    }
  `, this.apiKey);

  this.setRateLimit(res.rateLimit);

  if (paginator) {
    return res.data.warattacks as WarAttackPaginator;
  }

  return res.data.warattacks.data as WarAttack[];
}
