import { type MediaDto } from '../../models/media.dto';
import { type MovieAutofill } from '../models/movie-autofill.model';
import { createEmptyMovieEditorModel, type MovieEditorModel } from '../models/movie-editor.model';

export function toMovieEditorModel(movie: MediaDto): MovieEditorModel {
  return {
    addedDate: movie.addedDate?.slice(0, 10) ?? '',
    actors: movie.actors.join(', '),
    ageRating: movie.ageRating?.toString() ?? '',
    backdropUrl: movie.backdropUrl,
    compactPosterUrl: movie.compactPosterUrl,
    countries: movie.countries.join(', '),
    description: movie.description,
    directors: movie.director.join(', '),
    enName: movie.enName,
    extension: movie.extension,
    genres: [...movie.genres],
    id: movie.id,
    kpId: movie.kpId > 0 ? movie.kpId.toString() : '',
    movieLength: movie.movieLength > 0 ? movie.movieLength.toString() : '',
    name: movie.name,
    posterUrl: movie.posterUrl,
    quality: movie.quality,
    rating: movie.rating > 0 ? movie.rating.toString() : '',
    sequelsAndPrequels: movie.sequelsAndPrequels.join(', '),
    similarMovies: movie.similarMovies.join(', '),
    year: typeof movie.year === 'number' ? movie.year.toString() : movie.year.join(', '),
  };
}

export function toMediaDto(model: MovieEditorModel): MediaDto {
  return {
    addedDate: model.addedDate,
    actors: toStringList(model.actors),
    ageRating: model.ageRating ? Number(model.ageRating) : null,
    backdropUrl: model.backdropUrl.trim(),
    compactPosterUrl: model.compactPosterUrl.trim() || model.posterUrl.trim(),
    countries: toStringList(model.countries),
    description: model.description.trim(),
    director: toStringList(model.directors),
    enName: model.enName.trim(),
    extension: model.extension.trim(),
    genres: unique(model.genres),
    id: model.id,
    isSeries: false,
    kpId: Number(model.kpId) || 0,
    movieLength: Number(model.movieLength) || 0,
    name: model.name.trim(),
    posterUrl: model.posterUrl.trim(),
    quality: model.quality.trim(),
    rating: Number(model.rating) || 0,
    sequelsAndPrequels: toStringList(model.sequelsAndPrequels),
    similarMovies: toStringList(model.similarMovies),
    year: toYear(model.year),
  };
}

export function mergeMovieAutofill(model: MovieEditorModel, autofill: MovieAutofill): MovieEditorModel {
  return {
    ...model,
    actors: joinOrExisting(autofill.actors, model.actors),
    ageRating: autofill.ageRating?.toString() ?? model.ageRating,
    backdropUrl: autofill.backdropUrl || model.backdropUrl,
    compactPosterUrl: autofill.compactPosterUrl || model.compactPosterUrl,
    countries: joinOrExisting(autofill.countries, model.countries),
    description: autofill.description || model.description,
    directors: joinOrExisting(autofill.directors, model.directors),
    enName: autofill.enName || model.enName,
    genres: autofill.genres.length ? [...autofill.genres] : model.genres,
    kpId: autofill.kpId.toString(),
    movieLength: autofill.movieLength?.toString() ?? model.movieLength,
    name: autofill.name || model.name,
    posterUrl: autofill.posterUrl || model.posterUrl,
    rating: autofill.rating?.toString() ?? model.rating,
    sequelsAndPrequels: joinOrExisting(autofill.sequelsAndPrequels, model.sequelsAndPrequels),
    similarMovies: joinOrExisting(autofill.similarMovies, model.similarMovies),
    year: autofill.year?.toString() ?? model.year,
  };
}

export function cloneEmptyMovieEditorModel(): MovieEditorModel {
  return createEmptyMovieEditorModel();
}

export function toStringList(value: string): string[] {
  return unique(value.split(/[\n,]/));
}

function joinOrExisting(values: readonly string[], existing: string): string {
  return values.length ? values.join(', ') : existing;
}

function toYear(value: string): number | number[] {
  const years = value
    .split(',')
    .map((year) => Number(year.trim()))
    .filter((year) => Number.isInteger(year) && year > 0);
  return years.length <= 1 ? (years[0] ?? 0) : years;
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
