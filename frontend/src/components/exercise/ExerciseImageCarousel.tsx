import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/Carousel';
import { getExerciseImageUrl } from '@/lib/exerciseImage';
import { cn } from '@/lib/utils';

const IMAGE_INDICES = [0, 1] as const;

export interface ExerciseImageCarouselProps {
  exerciseId: string;
  exerciseName: string;
  className?: string;
  controlClassName?: string;
  aboveTheFold?: boolean;
}

export const ExerciseImageCarousel = ({
  exerciseId,
  exerciseName,
  className,
  controlClassName = 'opacity-100',
  aboveTheFold = false,
}: ExerciseImageCarouselProps): React.JSX.Element => (
  <Carousel
    aria-label={`Imagens de ${exerciseName}`}
    className={cn('group', className)}
    opts={{ loop: false }}
  >
    <CarouselContent>
      {IMAGE_INDICES.map((imageIndex) => (
        <CarouselItem key={imageIndex}>
          <Image
            src={getExerciseImageUrl(exerciseId, imageIndex)}
            alt={`${exerciseName} — imagem ${imageIndex + 1}`}
            className="block h-auto w-full object-contain"
            width={600}
            height={400}
            sizes="(max-width: 640px) 100vw, 600px"
            loading={aboveTheFold && imageIndex === 0 ? 'eager' : 'lazy'}
          />
        </CarouselItem>
      ))}
    </CarouselContent>
    <CarouselPrevious className={controlClassName} />
    <CarouselNext className={controlClassName} />
    <CarouselDots count={IMAGE_INDICES.length} />
  </Carousel>
);
