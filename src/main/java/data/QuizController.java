package data;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@Controller
public class QuizController {

    private final HerbQuizRepository herbQuizRepository;

    @Autowired
    public QuizController(HerbQuizRepository herbQuizRepository) {
        this.herbQuizRepository = herbQuizRepository;
    }

    @GetMapping(value = "/api/quiz")
    public ResponseEntity<Long> quiz() {
        long quizID = this.herbQuizRepository.count();
        return ResponseEntity.ok(quizID);
    }

    @PostMapping(value = "/api/quiz/submission")
    public ResponseEntity<?> quizSubmission(@RequestBody QuizSubmission quizSubmission) {
        return ResponseEntity.noContent().build();
    }
}
