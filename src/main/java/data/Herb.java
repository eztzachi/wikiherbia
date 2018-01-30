package data;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import javax.persistence.*;

@Data
@Entity
public class Herb {

    private @Id
    @GeneratedValue
    Long id;
    private String englishName;
    @Enumerated(EnumType.STRING)
    private HerbCategory category;
    private String description;

    private @Version
    @JsonIgnore
    Long version;

    private Herb() {}

    public Herb(String englishName, HerbCategory category, String description) {
        this.englishName = englishName;
        this.category = category;
        this.description = description;
    }
}