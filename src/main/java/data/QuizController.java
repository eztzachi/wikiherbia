package data;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.HashMap;
import java.util.Map;

@Controller
public class QuizController {

    private final HerbQuizRepository herbQuizRepository;
    private final QuizSubmissionRepository quizSubmissionRepository;

    @Autowired
    public QuizController(HerbQuizRepository herbQuizRepository, QuizSubmissionRepository quizSubmissionRepository) {
        this.herbQuizRepository = herbQuizRepository;
        this.quizSubmissionRepository = quizSubmissionRepository;
    }

    @GetMapping(value = "/api/quiz")
    public ResponseEntity<Long> quiz() {
        long quizID = this.herbQuizRepository.count();
        return ResponseEntity.ok(quizID);
    }

    @PostMapping(value = "/api/quiz/submission")
    public ResponseEntity<?> quizSubmission(@RequestBody QuizRequest quizSubmission) {
        Quiz quiz = herbQuizRepository.findOne(quizSubmission.getQuizID());
        Map<Long, Boolean> checklist = new HashMap<>();
        int correctAnswers = 0;
        for (HerbCategoryQuestion question : quiz.getQuestions()) {
            if (quizSubmission.getMapping().containsKey(question.getId()) &&
                    question.getCorrectAnswer() == quizSubmission.getMapping().get(question.getId())) {
                checklist.put(question.getId(), true);
                correctAnswers++;
            } else {
                checklist.put(question.getId(), false);
            }
        }
        double grade = 1.0 * correctAnswers / (quiz.getQuestions().size());
        QuizSubmission submission = new QuizSubmission(quiz, grade, checklist);
        quizSubmissionRepository.save(submission);
        return ResponseEntity.noContent().build();
    }
}
