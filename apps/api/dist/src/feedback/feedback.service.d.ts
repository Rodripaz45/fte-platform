import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
export declare class FeedbackService {
    create(createFeedbackDto: CreateFeedbackDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateFeedbackDto: UpdateFeedbackDto): string;
    remove(id: number): string;
}
