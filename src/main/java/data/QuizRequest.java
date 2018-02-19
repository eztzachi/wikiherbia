package data;

import java.util.Map;

public class QuizRequest {

    // questionID -> answer
    private Map<Long, Integer> mapping;
    private long quizID;

    public Map<Long, Integer> getMapping() {
        return mapping;
    }
    public long getQuizID() {return quizID;}

}
