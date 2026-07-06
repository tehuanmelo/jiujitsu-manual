import Link from 'next/link';
import { Hero } from '@/components/ui/animated-hero';

// Hero copy per locale. The rotating words must all agree with the
// titleLine2Prefix — in pt every word is feminine so "A mesma" fits each one.
const heroCopy = {
  en: {
    badge: 'Palms Sports · Professor Handbook',
    titleLine1: 'Every professor.',
    titleLine2Prefix: 'The same',
    words: ['standard', 'structure', 'discipline', 'progression', 'excellence'],
    description:
      'The rules and procedures our BJJ professors teach by — from white belt fundamentals to black belt promotions — all kept in one place so every class at Palms Sports is held to the same standard.',
    cta: 'Read the handbook',
  },
  pt: {
    badge: 'Palms Sports · Manual do Professor',
    titleLine1: 'Todo professor.',
    titleLine2Prefix: 'A mesma',
    words: ['referência', 'estrutura', 'disciplina', 'progressão', 'excelência'],
    description:
      'As regras e os procedimentos que orientam nossos professores de BJJ — dos fundamentos da faixa branca às promoções de faixa preta — reunidos em um só lugar para que todas as aulas da Palms Sports sigam o mesmo padrão.',
    cta: 'Leia o manual',
  },
};

export default async function HomePage(props: PageProps<'/[lang]'>) {
  const { lang } = await props.params;
  const t = heroCopy[lang as keyof typeof heroCopy] ?? heroCopy.en;

  return (
    <div className="flex flex-col flex-1">
      <Hero t={t} />
      {/* <div className="flex flex-col justify-center text-center pb-16">
        <p>
          You can open{' '}
          <Link href="/docs" className="font-medium underline">
            /docs
          </Link>{' '}
          and see the documentation.
        </p>
      </div> */}
    </div>
  );
}
