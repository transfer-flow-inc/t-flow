import {SupportInterface} from "./support-interface";

export interface AllSupportsInterface {
  content: SupportInterface[];
  pageable: {
    sort: {
      sorted: boolean;
      empty: boolean;
      unsorted: boolean;
    };
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  sort: {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
  };
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}
