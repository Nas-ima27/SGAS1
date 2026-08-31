import { IsInt, Max, Min } from 'class-validator';

export class UpdateAvancementDto {
  @IsInt()
  @Min(0)
  @Max(100)
  avancement!: number;
}
