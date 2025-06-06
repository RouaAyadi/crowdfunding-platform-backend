export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
}

export interface KeyMetric {
  label: string;
  value: string;
}

export interface Milestone {
  title: string;
  description: string;
  date: Date;
  completed: boolean;
} 