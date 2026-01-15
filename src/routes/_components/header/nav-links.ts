import {
  BarChart,
  CodeIcon,
  FileText,
  Globe,
  Handshake,
  HelpCircleIcon,
  Layers,
  Leaf,
  Plug,
  RotateCcw,
  Shield,
  Star,
  UserPlus,
  Users,
} from '@hugeicons/core-free-icons'
import type { LinkItemType } from '@/routes/_components/header/link-item'

export const productLinks: Array<LinkItemType> = [
  {
    label: 'Website Builder',
    href: '#',
    description: 'Create responsive websites with ease',
    icon: Globe,
  },
  {
    label: 'Cloud Platform',
    href: '#',
    description: 'Deploy and scale apps in the cloud',
    icon: Layers,
  },
  {
    label: 'Team Collaboration',
    href: '#',
    description: 'Tools to help your teams work better together',
    icon: UserPlus,
  },
  {
    label: 'Analytics',
    href: '#',
    description: 'Track and analyze your website traffic',
    icon: BarChart,
  },
  {
    label: 'Integrations',
    href: '#',
    description: 'Connect your apps and services',
    icon: Plug,
  },
  {
    label: 'API',
    href: '#',
    description: 'Build custom integrations with our API',
    icon: CodeIcon,
  },
]

export const companyLinks: Array<LinkItemType> = [
  {
    label: 'About Us',
    href: '#',
    description: 'Learn more about our story and team',
    icon: Users,
  },
  {
    label: 'Customer Stories',
    href: '#',
    description: 'See how we’ve helped our clients succeed',
    icon: Star,
  },
  {
    label: 'Partnerships',
    href: '#',
    icon: Handshake,
    description: 'Collaborate with us for mutual growth',
  },
]

export const companyLinks2: Array<LinkItemType> = [
  {
    label: 'Terms of Service',
    href: '#',
    icon: FileText,
  },
  {
    label: 'Privacy Policy',
    href: '#',
    icon: Shield,
  },
  {
    label: 'Refund Policy',
    href: '#',
    icon: RotateCcw,
  },
  {
    label: 'Blog',
    href: '#',
    icon: Leaf,
  },
  {
    label: 'Help Center',
    href: '#',
    icon: HelpCircleIcon,
  },
]
