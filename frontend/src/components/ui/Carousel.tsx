'use client';

import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react';
import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type CarouselApi = UseEmblaCarouselType[1];
type CarouselOptions = Parameters<typeof useEmblaCarousel>[0];
type CarouselPlugin = Parameters<typeof useEmblaCarousel>[1];

interface CarouselContextProps {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: CarouselApi;
  orientation: 'horizontal' | 'vertical';
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
}

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

const useCarousel = (): CarouselContextProps => {
  const context = React.useContext(CarouselContext);
  if (!context) throw new Error('useCarousel must be used within a Carousel');
  return context;
};

export interface CarouselProps extends React.ComponentProps<'div'> {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: 'horizontal' | 'vertical';
  setApi?: (api: CarouselApi) => void;
}

const Carousel = ({
  orientation = 'horizontal',
  opts,
  plugins,
  setApi,
  className,
  children,
  ...props
}: CarouselProps): React.JSX.Element => {
  const [carouselRef, api] = useEmblaCarousel(
    { ...opts, axis: orientation === 'horizontal' ? 'x' : 'y' },
    plugins ?? [],
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback((currentApi: CarouselApi): void => {
    if (!currentApi) return;
    setCanScrollPrev(currentApi.canScrollPrev());
    setCanScrollNext(currentApi.canScrollNext());
  }, []);

  const scrollPrev = React.useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = React.useCallback(() => api?.scrollNext(), [api]);

  React.useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  React.useEffect(() => {
    if (!api) return;
    const frame = requestAnimationFrame(() => onSelect(api));
    api.on('reInit', onSelect).on('select', onSelect);
    return () => {
      cancelAnimationFrame(frame);
      api.off('select', onSelect).off('reInit', onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        orientation,
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        className={cn('relative', className)}
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
};

const CarouselContent = ({
  className,
  ...props
}: React.ComponentProps<'div'>): React.JSX.Element => {
  const { carouselRef, orientation } = useCarousel();
  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div
        data-slot="carousel-content"
        className={cn('flex', orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col', className)}
        {...props}
      />
    </div>
  );
};

const CarouselItem = ({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element => {
  const { orientation } = useCarousel();
  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        'min-w-0 shrink-0 grow-0 basis-full',
        orientation === 'horizontal' ? 'pl-4' : 'pt-4',
        className,
      )}
      {...props}
    />
  );
};

export type CarouselControlProps = React.ComponentProps<typeof Button>;

const CarouselPrevious = ({
  className,
  size = 'icon',
  ...props
}: CarouselControlProps): React.JSX.Element => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();
  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      aria-label="Imagem anterior"
      disabled={!canScrollPrev}
      className={cn(
        'absolute size-8 rounded-full bg-card/85 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100',
        orientation === 'horizontal'
          ? 'left-2 top-1/2 -translate-y-1/2'
          : 'left-1/2 top-2 -translate-x-1/2 rotate-90',
        className,
      )}
      onClick={scrollPrev}
      {...props}
    >
      ‹
    </Button>
  );
};

const CarouselNext = ({
  className,
  size = 'icon',
  ...props
}: CarouselControlProps): React.JSX.Element => {
  const { orientation, scrollNext, canScrollNext } = useCarousel();
  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      aria-label="Próxima imagem"
      disabled={!canScrollNext}
      className={cn(
        'absolute size-8 rounded-full bg-card/85 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100',
        orientation === 'horizontal'
          ? 'right-2 top-1/2 -translate-y-1/2'
          : 'bottom-2 left-1/2 -translate-x-1/2 rotate-90',
        className,
      )}
      onClick={scrollNext}
      {...props}
    >
      ›
    </Button>
  );
};

interface CarouselDotsProps {
  count?: number;
}

const CarouselDots = ({ count = 0 }: CarouselDotsProps): React.JSX.Element => {
  const { api } = useCarousel();
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [snapCount, setSnapCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    const update = (): void => setSelectedIndex(api.selectedScrollSnap());
    const frame = requestAnimationFrame(() => {
      setSnapCount(api.scrollSnapList().length);
      update();
    });
    api.on('select', update).on('reInit', update);
    return () => {
      cancelAnimationFrame(frame);
      api.off('select', update).off('reInit', update);
    };
  }, [api]);

  const displayedCount = snapCount || count;

  return (
    <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-card/85 px-2 py-1 backdrop-blur">
      <div className="flex items-center gap-1" aria-label="Imagens do exercício">
        {Array.from({ length: displayedCount }, (_, index) => (
          <Button
            key={index}
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Imagem ${index + 1}`}
            aria-current={selectedIndex === index ? 'true' : undefined}
            className={cn(
              'size-2 rounded-full p-0',
              selectedIndex === index ? 'bg-foreground' : 'bg-muted-foreground/40',
            )}
            onClick={() => api?.scrollTo(index)}
          />
        ))}
      </div>
      <span className="text-[0.6875rem] font-medium text-muted-foreground">
        {selectedIndex + 1} / {displayedCount}
      </span>
    </div>
  );
};

export {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
};
