package com.BBTT.BBTTResort.repo;

import com.BBTT.BBTTResort.entity.ResortPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResortPackageRepository extends JpaRepository<ResortPackage, Long> {
}
