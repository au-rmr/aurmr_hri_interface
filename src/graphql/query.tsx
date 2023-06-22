import { useQuery, gql } from "@apollo/client";

export const GET_ALL_PROD = gql`
query getAllProds {
    getAllProducts {
      id
      asin
      name
      size_length
      size_width
      size_height
      size_units
      weight
      weight_units
      attributes {
        AttributeId
        AmazonProductId
        attribute {
          id
          value
        }
      }
    }
  }
`