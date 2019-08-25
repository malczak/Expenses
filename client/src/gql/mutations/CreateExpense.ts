type CreateExpenseParams = {
  user: string;
  amount: number;
  date?: number;
  description?: string;
  category?: string;
};

export const CreateExpense = `
    mutation Mutation($user: String!, $amount:Int!, $date:Int, $description: String, $category: String ) {
        createExpense(input:{
            user: $user,
            amount: $amount,
            date: $date,
            description: $description,
            categories: [$category]
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
