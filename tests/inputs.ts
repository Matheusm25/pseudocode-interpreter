export const UNIQUE_SET_VARIABLE = 'using username string;';

export const UNIQUE_DEFINE_CONSTANT = 'DEFINE admin_role_slug admin;';

export const DEFINE_WITH_OPERATION = `
using user_height_in_meters number;
define user_height_in_centimeters multiply(user_height_in_meters, 100);
`;

export const DEFINE_WITH_INVALID_OPERATION_ARGUMENT =
  'define user_height_in_centimeters multiply(user_height_in_meters, 100);';

export const DEFINE_WITH_MULTIPLE_OPERATIONS = `
using user_age number;
define user_age_in_days multiply(user_age, multiply(30, 12));
`;

export const DEFINE_WITH_MULTIPLE_PARAMETERS =
  'define number_for_test add(1, add(2, 3), subtract(5, 2));';

export const INVALID_OPERATION_NAME = 'define number_for_test invalid(1, 2);';

export const DEFINE_WITH_CONDITION = `
using user_role string;
define is_admin if user_role = admin then 1 else 0;
`;

export const INVALID_CONDITION = `
using user_role string;
define is_admin if user_role then 1 else 0;
`;

export const DEFINE_WITH_MULTIPLE_CONDITIONS = `
using user_role string;
using user_password string;

define default_password admin123;

define is_admin if user_role = admin and user_password = default_password then 1 else 0;
`;

export const DEFINE_WITH_CONDITIONS_AND_OPERATIONS = `
using user_height_in_meters number;
define is_tall if multiply(user_height_in_meters, 100) > 180 then 1 else 0;
`;

export const GREAT_THAN_CONDITION = `
using user_height_in_meters number;
define is_tall if user_height_in_meters > 180 then 1 else 0;
`;

export const GREAT_THAN_OR_EQUAL_CONDITION = `
using user_height_in_meters number;
define is_tall if user_height_in_meters >= 180 then 1 else 0;
`;

export const LESS_THAN_CONDITION = `
using user_height_in_meters number;
define is_short if user_height_in_meters < 180 then 1 else 0;
`;

export const LESS_THAN_OR_EQUAL_CONDITION = `
using user_height_in_meters number;
define is_short if user_height_in_meters <= 180 then 1 else 0;
`;

export const NOT_EQUAL_CONDITION = `
using user_role string;
define commom_user if user_role != admin then 1 else 0;
`;

export const REGEX_CONDITION = `
using user_name string;
define is_admin if user_name regex %admin% then 1 else 0;
`;

export const INVALID_TOKEN_TYPE = 'invalid username string;';

export const INVALID_VARIABLE_TYPE = 'using age integer;';

export const INVALID_NUMBER_OF_ARGUMENTS = 'using age;';
