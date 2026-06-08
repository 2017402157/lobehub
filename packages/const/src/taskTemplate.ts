import type { InterestAreaKey } from './interests';

export const TASK_TEMPLATE_ICONS = ['github'] as const;

export type TaskTemplateIcon = (typeof TASK_TEMPLATE_ICONS)[number];

export type TaskTemplateSkillSource = 'klavis' | 'lobehub';

export interface TaskTemplateSkillRequirement {
  /** Short identifier from `LOBEHUB_SKILL_PROVIDERS[i].id` or `KLAVIS_SERVER_TYPES[i].identifier`. */
  provider: string;
  source: TaskTemplateSkillSource;
}

export type TaskTemplateCategory =
  | 'content-creation'
  | 'engineering'
  | 'design'
  | 'learning-research'
  | 'business'
  | 'marketing'
  | 'product'
  | 'sales-customer'
  | 'operations'
  | 'hr'
  | 'finance-legal'
  | 'creator'
  | 'investing'
  | 'parenting'
  | 'health'
  | 'hobbies'
  | 'personal-life';

export interface TaskTemplate {
  category: TaskTemplateCategory;
  cronPattern: string;
  description: string;
  /** Optional icon identifier; consumers resolve it to a component. */
  icon?: TaskTemplateIcon;
  id: number;
  instruction: string;
  interests: InterestAreaKey[];
  /** Skills that enrich the brief but are not required to run it. */
  optionalSkills?: TaskTemplateSkillRequirement[];
  /** Skill dependencies. The `source` field routes the connection flow. */
  requiresSkills?: TaskTemplateSkillRequirement[];
  title: string;
}

export const TASK_TEMPLATE_RECOMMEND_COUNT = 3;
