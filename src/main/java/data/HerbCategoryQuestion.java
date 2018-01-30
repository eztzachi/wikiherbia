package data;

import lombok.Data;

import javax.persistence.*;
import java.util.Collection;

@Data
@Entity
public class HerbCategoryQuestion {

    private @Id
    @GeneratedValue
    Long id;
    private String textTemplate = "What is the category of";
    @ElementCollection(targetClass = HerbCategory.class)
    private Collection<HerbCategory> options;
    @ManyToOne
    private Herb herb;

    private HerbCategoryQuestion() {}

    public HerbCategoryQuestion(Collection<HerbCategory> options, Herb herb) {
        this.options = options;
        this.herb = herb;
    }
}
