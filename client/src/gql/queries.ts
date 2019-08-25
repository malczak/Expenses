export type ExpenseType = {
  id: string;
  user: string;
  date: number;
  amount: number;
  description: string;
  categories: string[];
};

export const GetTodaysExpenses = `
    query GetTodaysExpenses{
        getTodayExpenses {
            id
            user
            date
            amount
            description
            categories
        }
    }
`;

export const CreateExpense = `
    mutation Mutation($user: String!, $amount:Int!, $date:Int, $description: String, $category: [String!]) {
        createExpense(input:{
            user: $user,
            amount: $amount,
            date: $date,
            description: $description,
            categories: $category
        }){
            id
            user
            date
            amount
            description
            categories
        }
    }
`;
