import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
export declare class FeedbackController {
    private readonly feedbackService;
    constructor(feedbackService: FeedbackService);
    create(createFeedbackDto: CreateFeedbackDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateFeedbackDto: UpdateFeedbackDto): string;
    remove(id: string): string;
}
