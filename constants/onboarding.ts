// constants/onboarding.ts
export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Os melhores livros para você',
    description: 'Descubra milhares de histórias incríveis escritas por autores talentosos da nossa comunidade.',
  },
  {
    id: '2',
    title: 'Crie suas próprias histórias',
    description: 'Liberte sua criatividade e compartilhe suas histórias com leitores de todo o mundo.',
  },
  {
    id: '3',
    title: 'Conecte-se com leitores',
    description: 'Faça parte de uma comunidade apaixonada por leitura e escrita.',
  },
];