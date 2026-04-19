export type IOTest = {
  id: number;
  name: string;
  test_in: string;
  test_out: string;
};

export type Activity = {
  id: number;
  course_id: number;
  category_id: number;
  category_name: string;
  category_description: string;
  name: string;
  description: string;
  language: string;
  points: number;
  is_io_tested: boolean;
  compilation_flags: string;
  active: boolean;
  deleted: boolean;
  initial_code: Record<string, string>;
  starting_rplfile_id: number;
  submission_status: string;
  last_submission_date: string;
  activity_unit_tests_content: string;
  activity_io_tests: IOTest[];
  date_created: string;
  last_updated: string;
};

export type Student = {
  id: number;
  name: string;
  surname: string;
  student_id: string;
  username: string;
  email: string;
  email_validated: boolean;
  university: string;
  degree: string;
  date_created: string;
  last_updated: string;
  role: string;
  accepted: boolean;
  img_uri: string | null;
};

export type Category = {
  id: number;
  name: string;
  description?: string;
};

export type Course = {
  id: number;
  name: string;
  subject_id: string;
  description: string;
  active: boolean;
  semester: string;
  img_uri: string;
  date_created: string;
  last_updated: string;
  enrolled?: boolean;
};

export type IOTestRunResult = {
  id: number;
  name: string;
  test_in: string;
  expected_output: string;
  run_output: string;
};

export type UnitTestRunResult = {
  id: number;
  name: string;
  passed: boolean;
  error_messages: string | null;
};

export type Notification = {
  message: string;
  redirect: string;
  type: string;
};

export type SubmissionResult = {
  id: number;
  activity_id: number;
  submission_rplfile_name: string;
  submission_rplfile_type: string;
  submission_rplfile_id: number;
  activity_starting_rplfile_name: string;
  activity_starting_rplfile_type: string;
  activity_starting_rplfile_id: number;
  activity_language: string;
  activity_unit_tests_content: string;
  activity_io_tests_input: string[];
  submission_status: string;
  exit_message: string;
  stderr: string;
  stdout: string;
  io_tests_run_results: IOTestRunResult[];
  unit_tests_run_results: UnitTestRunResult[];
  submission_date: string;
  submited_code: Record<string, string>;
  is_final_solution: boolean;
  ai_hint: string | null;
};

export const FILE_DISPLAY_MODE = {
  READ_WRITE: "read_write",
  READ: "read",
  HIDDEN: "hidden",
  WRITE_CANT_DELETE: "write_cant_delete",
} as const;

export type FileDisplayMode = (typeof FILE_DISPLAY_MODE)[keyof typeof FILE_DISPLAY_MODE];
export type FileMetadata = { display: FileDisplayMode };
export type FilesMetadata = Record<string, FileMetadata>;

export const READ_ONLY_DISPLAY_MODES: FileDisplayMode[] = [
  FILE_DISPLAY_MODE.READ,
  FILE_DISPLAY_MODE.HIDDEN,
];
export const DELETEABLE_DISPLAY_MODES: FileDisplayMode[] = [FILE_DISPLAY_MODE.READ_WRITE];
